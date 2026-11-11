
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
const MAX_FINAL_PRODUCTS = 20;

type PriceRange = {
  min: number;
  max: number;
};

type DigikalaSearchDiagnostic = {
  query: string;
  success: boolean;
  linkCount: number;
  error?: string;
};

type DigikalaProductDiagnostic = {
  received: number;
  failed: number;
  validPrice: number;
  invalidPrice: number;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getProductPriceInToman(
  product: ProductSearchResult,
): number | null {
  if (
    !product.verified.price ||
    product.price === null ||
    !Number.isFinite(product.price) ||
    product.price <= 0
  ) {
    return null;
  }

  if (product.currency === "IRR") {
    return product.price / 10;
  }

  if (product.currency === "IRT") {
    return product.price;
  }

  return null;
}

function filterProductsByBudget(
  products: ProductSearchResult[],
  priceRange: PriceRange,
): ProductSearchResult[] {
  return products.filter((product) => {
    const price = getProductPriceInToman(product);

    return (
      price !== null &&
      price >= priceRange.min &&
      price <= priceRange.max
    );
  });
}

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

    const matchedWords = words.filter((word) =>
      title.includes(word),
    );

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
): Promise<{
  products: ProductSearchResult[];
  failed: number;
}> {
  const products: ProductSearchResult[] = [];
  let failed = 0;

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
          failed++;

          console.error(
            "[KADOBOT][DIGIKALA][PRODUCT_DETAIL_ERROR]",
            {
              error: getErrorMessage(error),
            },
          );

          return null;
        }
      }),
    );

    products.push(
      ...results.filter(
        (product): product is ProductSearchResult =>
          product !== null,
      ),
    );
  }

  return {
    products,
    failed,
  };
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
  priceRange?: PriceRange,
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

  const productsByQuery: ProductSearchResult[][] =
    queries.map(() => []);

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

        const searchDiagnostics: DigikalaSearchDiagnostic[] =
          searchResults.map((result, index) => ({
            query: queries[index],
            success: result.status === "fulfilled",
            linkCount:
              result.status === "fulfilled"
                ? result.value.length
                : 0,
            ...(result.status === "rejected"
              ? { error: getErrorMessage(result.reason) }
              : {}),
          }));

        const successfulSearches = searchResults.filter(
          (result) => result.status === "fulfilled",
        ).length;

        const totalLinks = searchDiagnostics.reduce(
          (sum, item) => sum + item.linkCount,
          0,
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

        const productDiagnostics: DigikalaProductDiagnostic = {
          received: productResults.reduce(
            (sum, result) => sum + result.products.length,
            0,
          ),
          failed: productResults.reduce(
            (sum, result) => sum + result.failed,
            0,
          ),
          validPrice: productResults.reduce(
            (sum, result) =>
              sum +
              result.products.filter(
                (product) => getProductPriceInToman(product) !== null,
              ).length,
            0,
          ),
          invalidPrice: productResults.reduce(
            (sum, result) =>
              sum +
              result.products.filter(
                (product) => getProductPriceInToman(product) === null,
              ).length,
            0,
          ),
        };

        productResults.forEach((result, index) => {
          productsByQuery[index].push(...result.products);
        });

        const storeProducts = deduplicateProducts(
          productResults.flatMap((result) => result.products),
        );

        const searchFailed = successfulSearches === 0;
        const detailFailed =
          totalLinks > 0 && productDiagnostics.received === 0;

        const sourceSuccess =
          !searchFailed && !detailFailed && storeProducts.length > 0;

        sources.push({
          store: store.id,
          method,
          success: sourceSuccess,
          resultCount: storeProducts.length,
          ...(!sourceSuccess
            ? {
                error: searchFailed
                  ? "ALL_DIGIKALA_SEARCH_REQUESTS_FAILED"
                  : detailFailed
                    ? "ALL_DIGIKALA_PRODUCT_DETAIL_REQUESTS_FAILED"
                    : "NO_DIGIKALA_PRODUCTS_FOUND",
              }
            : {}),
        });

        console.info(
          "[KADOBOT][DIGIKALA][SEARCH_DIAGNOSTIC]",
          {
            queriesCount: queries.length,
            successfulSearches,
            failedSearches: queries.length - successfulSearches,
            totalLinks,
            searches: searchDiagnostics,
            products: productDiagnostics,
            finalProductsBeforeBudget: storeProducts.length,
          },
        );
      } else {
        const searchResults = await Promise.allSettled(
          queries.map((query) =>
            searchWithTavily(query, store.id),
          ),
        );

        searchResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            productsByQuery[index].push(...result.value);
          } else {
            console.error(
              "[KADOBOT][PRODUCT_SEARCH][TAVILY_ERROR]",
              {
                store: store.id,
                query: queries[index],
                error: getErrorMessage(result.reason),
              },
            );
          }
        });

        const successfulSearches = searchResults.filter(
          (result) => result.status === "fulfilled",
        ).length;

        const storeProducts = deduplicateProducts(
          searchResults.flatMap((result) =>
            result.status === "fulfilled" ? result.value : [],
          ),
        );

        const sourceSuccess =
          successfulSearches > 0 && storeProducts.length > 0;

        sources.push({
          store: store.id,
          method,
          success: sourceSuccess,
          resultCount: storeProducts.length,
          ...(!sourceSuccess
            ? {
                error:
                  successfulSearches === 0
                    ? "ALL_TAVILY_SEARCH_REQUESTS_FAILED"
                    : "NO_TAVILY_PRODUCTS_FOUND",
              }
            : {}),
        });
      }
    } catch (error) {
      console.error(
        `[KADOBOT][PRODUCT_SEARCH][STORE_ERROR]`,
        {
          store: store.id,
          error: getErrorMessage(error),
        },
      );

      sources.push({
        store: store.id,
        method,
        success: false,
        resultCount: 0,
        error: getErrorMessage(error),
      });
    }
  }

  const productsBeforeBudget = deduplicateProducts(
    productsByQuery.flat(),
  );

  const filteredProductsByQuery = priceRange
    ? productsByQuery.map((bucket) =>
        filterProductsByBudget(bucket, priceRange),
      )
    : productsByQuery;

  const productsAfterBudget = deduplicateProducts(
    filteredProductsByQuery.flat(),
  );

  const removedByBudget =
    productsBeforeBudget.length - productsAfterBudget.length;

  const finalProducts = selectDiverseProducts(
    filteredProductsByQuery,
    queries,
  );

  console.info(
    "[KADOBOT][PRODUCT_SEARCH][FINAL_DIAGNOSTIC]",
    {
      productsBeforeBudget: productsBeforeBudget.length,
      productsAfterBudget: productsAfterBudget.length,
      removedByBudget,
      priceRange: priceRange ?? null,
      finalProducts: finalProducts.length,
    },
  );

  return {
    success: sources.some((source) => source.success),
    query: queries.join(" | "),
    products: finalProducts,
    sources,
  };
}
