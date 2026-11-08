
import { NextRequest, NextResponse } from "next/server";
import { isProductUrl } from "@/lib/product-search/url-validator";

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json({
      success: false,
      error: "PRODUCT_URL_REQUIRED",
    });
  }

  let productUrl: URL;

  try {
    productUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json({
      success: false,
      error: "INVALID_URL",
    });
  }

  if (
    !["digikala.com", "www.digikala.com"].includes(
      productUrl.hostname
    ) ||
    !isProductUrl(productUrl.toString(), "digikala")
  ) {
    return NextResponse.json({
      success: false,
      error: "INVALID_PRODUCT_URL",
    });
  }

  const productMatch = productUrl.pathname.match(
    /\/product\/dkp-(\d+)/
  );

  if (!productMatch) {
    return NextResponse.json({
      success: false,
      error: "PRODUCT_ID_NOT_FOUND",
    });
  }

  const productId = productMatch[1];

  try {
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
      return NextResponse.json({
        success: false,
        status: response.status,
        error: "DIGIKALA_API_ERROR",
      });
    }

    const result = await response.json();

    const product = result?.data?.product;

    if (!product) {
      return NextResponse.json({
        success: false,
        error: "PRODUCT_DATA_NOT_FOUND",
      });
    }

    const variant =
      product.default_variant ?? product.variants?.[0] ?? null;

    const priceIRR =
      variant?.price?.selling_price ?? null;

    const image =
      product.images?.main?.url?.[0] ?? null;

    const relativeProductUrl = product.url?.uri ?? null;

    const finalProductUrl = relativeProductUrl
      ? relativeProductUrl.startsWith("http")
        ? relativeProductUrl
        : `https://www.digikala.com${relativeProductUrl}`
      : productUrl.toString();

    const warehouseAvailable =
      variant?.properties?.in_digikala_warehouse === true;

    const shipmentDescription =
      variant?.shipment_methods?.description ?? "";

    let availability: "available" | "unavailable" | "unknown" =
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

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        title: product.title_fa ?? product.title_en ?? null,
        brand: product.brand?.title ?? null,
        url: finalProductUrl,
        image,
        priceIRR,
        priceToman:
          typeof priceIRR === "number"
            ? Math.round(priceIRR / 10)
            : null,
        currency: "IRR",
        seller: variant?.seller?.title ?? null,
        availability,
        rating: product.rating?.rate ?? null,
        ratingCount: product.rating?.count ?? null,
        description:
          product.review?.description ?? null,
      },
      verified: {
        url: Boolean(finalProductUrl),
        price: typeof priceIRR === "number",
        image: Boolean(image),
        availability: availability !== "unknown",
      },
      sourceMethod: "digikala_product_api",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "UNKNOWN_ERROR",
    });
  }
}
