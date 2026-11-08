
import type { ProductSource } from "./types";

const EXCLUDED_PATHS = [
  "/mag/",
  "/blog/",
  "/article/",
  "/articles/",
  "/search/",
  "/category/",
  "/categories/",
  "/landing/",
  "/brand/",
  "/brands/",
];

export function isProductUrl(
  rawUrl: string,
  store: ProductSource
): boolean {
  try {
    const url = new URL(rawUrl);
    const path = url.pathname.toLowerCase();

    if (
      EXCLUDED_PATHS.some((excluded) =>
        path.includes(excluded)
      )
    ) {
      return false;
    }

    const patterns: Partial<Record<ProductSource, RegExp>> = {
      digikala: /^\/product\/dkp-[^/]+(?:\/[^/]+)?\/?$/,
      torob: /^\/p\/[^/]+\/?$/,
      basalam: /^\/product\/[^/]+\/?$/,
    };

    const pattern = patterns[store];

    if (!pattern) {
      return false;
    }

    return pattern.test(path);
  } catch {
    return false;
  }
}
