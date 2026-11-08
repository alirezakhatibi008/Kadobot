
import type {
  ProductSearchResult,
  ProductSource,
} from "../types";

import { isProductUrl } from "../url-validator";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

type TavilyResponse = {
  results?: TavilyResult[];
};

const STORE_DOMAINS: Record<ProductSource, string> = {
  digikala: "digikala.com",
  basalam: "basalam.com",
  torob: "torob.com",
  digistyle: "digistyle.com",
  golgift: "gol.gift",
  khanoumi: "khanoumi.com",
  taaghche: "taaghche.com",
  snappshop: "shop.snapp.ir",
  janebi: "janebi.com",
  tapsishop: "tapsi.shop",
};

export async function searchWithTavily(
  query: string,
  store: ProductSource
): Promise<ProductSearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY_MISSING");
  }

  const domain = STORE_DOMAINS[store];

  const response = await fetch(
    "https://api.tavily.com/search",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `خرید ${query} سایت:${domain}`,
        search_depth: "advanced",
        max_results: 20,
        include_domains: [domain],
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();

    let errorMessage = errorBody;

    try {
      const parsed = JSON.parse(errorBody);

      errorMessage =
        parsed.detail?.error ||
        parsed.detail ||
        parsed.message ||
        parsed.error ||
        errorBody;
    } catch {
      // پاسخ سرور JSON نیست
    }

    throw new Error(
      `TAVILY_HTTP_${response.status}: ${String(
        errorMessage
      ).slice(0, 500)}`
    );
  }

  const data: TavilyResponse = await response.json();

  const uniqueResults = new Map<string, TavilyResult>();

  for (const item of data.results || []) {
    if (!item.url) continue;

    try {
      const url = new URL(item.url);

      const isCorrectDomain =
        url.hostname === domain ||
        url.hostname.endsWith(`.${domain}`);

      if (
        !isCorrectDomain ||
        !isProductUrl(item.url, store)
      ) {
        continue;
      }

      const normalizedUrl = item.url.split("?")[0];

      if (!uniqueResults.has(normalizedUrl)) {
        uniqueResults.set(normalizedUrl, item);
      }
    } catch {
      continue;
    }
  }

  return Array.from(uniqueResults.values()).map(
    (item, index) => ({
      id: `${store}-${index}-${encodeURIComponent(
        item.url || ""
      )}`,
      title: item.title || "محصول بدون نام",
      url: item.url || "",
      image: null,
      price: null,
      currency: null,
      store,
      description: item.content || null,
      availability: "unknown",
      verified: {
        url: false,
        price: false,
        image: false,
        availability: false,
      },
      sourceMethod: "tavily_advanced_search",
    })
  );
}
