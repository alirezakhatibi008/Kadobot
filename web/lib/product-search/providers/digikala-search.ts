type DigikalaSearchItem = {
  id: number;
  title_fa?: string;
  url?: {
    uri?: string;
    params?: {
      variant_id?: number;
    }[];
  };
};

type DigikalaSearchResponse = {
  data?: {
    products?: DigikalaSearchItem[];
    pager?: {
      current_page?: number;
      total_pages?: number;
      total_items?: number;
    };
  };
};

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

function normalizeModel(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isRelevantProduct(
  title: string,
  query: string,
): boolean {
  const normalizedTitle = normalizeText(title);
  const normalizedQuery = normalizeText(query);

  const modelCodes =
    query.match(/[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)+/g) ?? [];

  if (modelCodes.length > 0) {
    const titleModel = normalizeModel(normalizedTitle);

    return modelCodes.every((model) =>
      titleModel.includes(normalizeModel(model)),
    );
  }

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
  ]);

  const queryWords = normalizedQuery
    .split(" ")
    .filter(
      (word) =>
        word.length >= 2 &&
        !ignoredWords.has(word) &&
        !/^\d+$/.test(word),
    );

  if (queryWords.length === 0) {
    return true;
  }

  const matchedWords = queryWords.filter((word) =>
    normalizedTitle.includes(word),
  );

  return matchedWords.length / queryWords.length >= 0.6;
}

async function fetchDigikalaSearchPage(
  query: string,
  page: number,
): Promise<DigikalaSearchResponse> {
  const apiUrl = new URL(
    "https://api.digikala.com/v1/search/",
  );

  apiUrl.searchParams.set("q", query);
  apiUrl.searchParams.set("page", String(page));

  const response = await fetch(apiUrl.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "fa-IR,fa;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "x-web-client": "mobile",
      "x-web-client-id": "web",
      "x-web-optimize-response": "1",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(
      `DIGIKALA_SEARCH_ERROR_${response.status}_PAGE_${page}`,
    );
  }

  return response.json();
}

export async function searchDigikala(
  query: string,
): Promise<string[]> {
  const MAX_PAGES = 3;
  const MAX_PRODUCTS = 24;

  const collectedProducts: DigikalaSearchItem[] = [];
  const seenProductIds = new Set<number>();

  let totalPages = MAX_PAGES;

  for (let page = 1; page <= MAX_PAGES; page++) {
    if (page > totalPages) break;

    const result = await fetchDigikalaSearchPage(query, page);

    const items = result?.data?.products;

    if (!Array.isArray(items)) {
      if (page === 1) {
        throw new Error("DIGIKALA_PRODUCTS_NOT_FOUND");
      }

      break;
    }

    const reportedTotalPages = result?.data?.pager?.total_pages;

    if (
      typeof reportedTotalPages === "number" &&
      reportedTotalPages > 0
    ) {
      totalPages = Math.min(reportedTotalPages, MAX_PAGES);
    }

    for (const item of items) {
      if (
        typeof item.id !== "number" ||
        typeof item.title_fa !== "string" ||
        typeof item.url?.uri !== "string" ||
        !item.url.uri.startsWith("/product/dkp-")
      ) {
        continue;
      }

      if (seenProductIds.has(item.id)) continue;

      if (!isRelevantProduct(item.title_fa, query)) continue;

      seenProductIds.add(item.id);
      collectedProducts.push(item);

      if (collectedProducts.length >= MAX_PRODUCTS) break;
    }

    if (collectedProducts.length >= MAX_PRODUCTS) break;
  }

  return collectedProducts
    .slice(0, MAX_PRODUCTS)
    .map(
      (item) => `https://www.digikala.com${item.url!.uri}`,
    );
}