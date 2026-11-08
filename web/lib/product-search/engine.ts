
import type {
  ProductSearchResponse,
  ProductSearchResult,
  ProductSource,
} from "./types";

import { ACTIVE_STORES } from "./stores";
import { searchWithTavily } from "./providers/tavily";
import { searchDigikala } from "./providers/digikala-search";
import { getDigikalaProduct } from "./providers/digikala";

const MAX_QUERIES = 6;
const MAX_PRODUCTS_PER_QUERY = 12;
const MAX_FINAL_PRODUCTS = 8;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ۀ/g, "ه")
    .replace(/ة/g, "ه")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function getSearchWords(value: string): string[] {
  const ignoredWords = new Set([
    "هدیه",
    "برای",
    "مناسب",
    "خاص",
    "و",
    "با",
    "از",
    "به",
    "در",
    "یک",
    "این",
    "آن",
  ]);

  return normalizeText(value)
    .split(" ")
    .filter(
      (word) =>
        word.length >= 2 &&
        !ignoredWords.has(word) &&
        !/^\d+$/.test(word),
    );
}

function getProductScore(
  product: ProductSearchResult,
  queries: string[],
): number {
  const title = normalizeText(product.title);

  let bestScore = 0;

  for (const query of queries) {
    const words = getSearchWords(query);
    if (words.length === 0) continue;

    const matchedWords = words.filter((word) => title.includes(word));
    const score = matchedWords.length / words.length;

    bestScore = Math.max(bestScore, score);
  }

  if (product.verified.image) bestScore += 0.05;
  if (product.verified.price) bestScore += 0.05;
  if (product.verified.availability) bestScore += 0.03;

  return bestScore;
}

function deduplicateQueries(queries: string[]): string[] {
  const seen = new Set<string>();

  return queries
    .map((query) => query.trim())
    .filter(Boolean)
    .filter((query) => {
      const normalized = normalizeText(query);

      if (!normalized || seen.has(normalized)) return false;

      seen.add(normalized);
      return true;
    })
    .slice(0, MAX_QUERIES);
}

function deduplicateProducts(
  products: ProductSearchResult[],
): ProductSearchResult[] {
  const seen = new Set<string>();

  return products.filter((product) => {
    const key = product.url.trim().toLowerCase();

    if (!key || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

async function fetchDigikalaProducts(
  productUrls: string[],
  concurrency = 4,
): Promise<ProductSearchResult[]> {
  const products: ProductSearchResult[] = [];

  for (
    let index = 0;
    index < productUrls.length;
    index += concurrency
  ) {
    const batch = productUrls.slice(index, index + concurrency);

    const results = await Promise.all(
      batch.map(async (url) => {
        try {
          return await getDigikalaProduct(url);
        } catch (error) {
          console.error("Digikala product detail error:", url, error);
          return null;
        }
      }),
    );

    products.push(
      ...results.filter(
        (product): product is ProductSearchResult => product !== null,
      ),
    );
  }

  return products;
}

/**
 * نتایج هر عبارت را جداگانه رتبه‌بندی می‌کند
 * و سپس از عبارت‌های مختلف به‌صورت نوبتی محصول انتخاب می‌کند.
 */
function selectDiverseProducts(
  productsByQuery: ProductSearchResult[][],
  queries: string[],
): ProductSearchResult[] {
  const rankedBuckets = productsByQuery.map((products, index) => {
    const query = queries[index];

    return deduplicateProducts(products)
      .map((product) => ({
        product,
        score: getProductScore(product, [query]),
      }))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);
  });

  const selected: ProductSearchResult[] = [];
  const seen = new Set<string>();
  const positions = rankedBuckets.map(() => 0);

  while (selected.length < MAX_FINAL_PRODUCTS) {
    let addedInRound = false;

    for (
      let bucketIndex = 0;
      bucketIndex < rankedBuckets.length;
      bucketIndex++
    ) {
      if (selected.length >= MAX_FINAL_PRODUCTS) break;

      const bucket = rankedBuckets[bucketIndex];
      let product: ProductSearchResult | undefined;

      while (positions[bucketIndex] < bucket.length) {
        const candidate = bucket[positions[bucketIndex]];
        positions[bucketIndex]++;

        const key = candidate.url.trim().toLowerCase();

        if (key && !seen.has(key)) {
          seen.add(key);
          product = candidate;
          break;
        }
      }

      if (product) {
        selected.push(product);
        addedInRound = true;
      }
    }

    if (!addedInRound) break;
  }

  return selected;
}

export async function searchProducts(
  input: string | string[],
  selectedStores: ProductSource[] = ["digikala"],
): Promise<ProductSearchResponse> {
  const queries = deduplicateQueries(
    Array.isArray(input) ? input : [input],
  );

  if (queries.length === 0) {
    return {
      success: false,
      query: "",
      products: [],
      sources: [],
    };
  }

  const productsByQuery: ProductSearchResult[][] = queries.map(() => []);
  const sources: ProductSearchResponse["sources"] = [];

  const storesToSearch = ACTIVE_STORES.filter((store) =>
    selectedStores.includes(store.id),
  );

  for (const store of storesToSearch) {
    const method =
      store.id === "digikala"
        ? "digikala_search_api_and_product_api"
        : "tavily_search";

    try {
      if (store.id === "digikala") {
        const searchResults = await Promise.allSettled(
          queries.map((query) => searchDigikala(query)),
        );

        const productUrlsByQuery = searchResults.map((result) =>
          result.status === "fulfilled"
            ? result.value.slice(0, MAX_PRODUCTS_PER_QUERY)
            : [],
        );

        const productResults = await Promise.all(
          productUrlsByQuery.map(async (urls) => {
            const uniqueUrls = Array.from(new Set(urls));
            return fetchDigikalaProducts(uniqueUrls, 4);
          }),
        );

        productResults.forEach((products, index) => {
          productsByQuery[index].push(...products);
        });

        const storeProducts = deduplicateProducts(
          productResults.flat(),
        );

        sources.push({
          store: store.id,
          method,
          success: true,
          resultCount: storeProducts.length,
        });
      } else {
        const searchResults = await Promise.allSettled(
          queries.map((query) =>
            searchWithTavily(query, store.id),
          ),
        );

        searchResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            productsByQuery[index].push(...result.value);
          }
        });

        const storeProducts = deduplicateProducts(
          searchResults.flatMap((result) =>
            result.status === "fulfilled" ? result.value : [],
          ),
        );

        sources.push({
          store: store.id,
          method,
          success: true,
          resultCount: storeProducts.length,
        });
      }
    } catch (error) {
      console.error(`Product search error for ${store.id}:`, error);

      sources.push({
        store: store.id,
        method,
        success: false,
        resultCount: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const finalProducts = selectDiverseProducts(
    productsByQuery,
    queries,
  );

  return {
    success: sources.some((source) => source.success),
    query: queries.join(" | "),
    products: finalProducts,
    sources,
  };
}
