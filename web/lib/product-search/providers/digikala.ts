import type { ProductSearchResult } from "../types";
import { isProductUrl } from "../url-validator";

export async function getDigikalaProduct(
  rawUrl: string
): Promise<ProductSearchResult> {
  let productUrl: URL;

  try {
    productUrl = new URL(rawUrl);
  } catch {
    throw new Error("INVALID_PRODUCT_URL");
  }

  if (
    !["digikala.com", "www.digikala.com"].includes(
      productUrl.hostname
    ) ||
    !isProductUrl(productUrl.toString(), "digikala")
  ) {
    throw new Error("INVALID_PRODUCT_URL");
  }

  const match = productUrl.pathname.match(
    /\/product\/dkp-(\d+)/
  );

  if (!match) {
    throw new Error("PRODUCT_ID_NOT_FOUND");
  }

  const productId = match[1];

  const apiUrl = new URL(
    `https://api.digikala.com/product/v1/products/${productId}/`
  );

  apiUrl.searchParams.set("product_id", productId);

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
    throw new Error(`DIGIKALA_API_ERROR_${response.status}`);
  }

  const result = await response.json();
  const product = result?.data?.product;

  if (!product) {
    throw new Error("PRODUCT_DATA_NOT_FOUND");
  }

  const variant =
    product.default_variant ?? product.variants?.[0] ?? null;

  const priceIRR =
    typeof variant?.price?.selling_price === "number"
      ? variant.price.selling_price
      : null;

  const image =
    product.images?.main?.url?.[0] ?? null;

  const relativeUrl = product.url?.uri ?? null;

  const finalUrl = relativeUrl
    ? relativeUrl.startsWith("http")
      ? relativeUrl
      : `https://www.digikala.com${relativeUrl}`
    : productUrl.toString();

  const warehouseAvailable =
    variant?.properties?.in_digikala_warehouse === true;

  const shipmentDescription =
    variant?.shipment_methods?.description ?? "";

  let availability: ProductSearchResult["availability"] =
    "unknown";

  if (
    variant?.status === "marketable" &&
    (warehouseAvailable ||
      shipmentDescription.includes("موجود"))
  ) {
    availability = "available";
  } else if (
    variant?.status &&
    variant.status !== "marketable"
  ) {
    availability = "unavailable";
  }

  return {
    id: `digikala-${product.id}`,
    title:
      product.title_fa ??
      product.title_en ??
      "محصول دیجی‌کالا",
    url: finalUrl,
    image,
    price: priceIRR,
    currency: priceIRR !== null ? "IRR" : null,
    store: "digikala",
    description:
      product.review?.description ??
      product.description?.brief ??
      null,
    availability,
    verified: {
      url: true,
      price: priceIRR !== null,
      image: Boolean(image),
      availability: availability !== "unknown",
    },
    sourceMethod: "digikala_product_api",
  };
}