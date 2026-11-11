
import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/product-search/engine";
import { ACTIVE_STORES } from "@/lib/product-search/stores";
import type { ProductSource } from "@/lib/product-search/types";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      {
        success: false,
        error: "SEARCH_QUERY_REQUIRED",
        message: "عبارت جست‌وجو را وارد کن.",
      },
      { status: 400 }
    );
  }

  const requestedStores =
    request.nextUrl.searchParams.get("stores");

  const validStoreIds = ACTIVE_STORES.map(
    (store) => store.id
  );

  const selectedStores: ProductSource[] = requestedStores
    ? requestedStores
        .split(",")
        .map((store) => store.trim())
        .filter((store): store is ProductSource =>
          validStoreIds.includes(store as ProductSource)
        )
    : ["digikala"];

  if (selectedStores.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "NO_VALID_STORES",
        message: "فروشگاه معتبری برای جست‌وجو انتخاب نشده است.",
      },
      { status: 400 }
    );
  }

  try {
    const result = await searchProducts(
      query,
      selectedStores
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
