
import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/product-search/engine";
import { ACTIVE_STORES } from "@/lib/product-search/stores";
import type { ProductSource } from "@/lib/product-search/types";

const GAPGPT_BASE_URL = "https://api.gapgpt.app/v1";
const GAPGPT_MODEL = "gpt-6-luna";

async function generateGiftSearchQueries(
  userQueries: string[],
): Promise<string[]> {
  const apiKey = process.env.GAPGPT_API_KEY;

  if (!apiKey) {
    throw new Error("GAPGPT_API_KEY_MISSING");
  }

  const response = await fetch(
    `${GAPGPT_BASE_URL}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GAPGPT_MODEL,
        messages: [
          {
            role: "system",
            content: `
تو دستیار هوشمند انتخاب هدیه در کادوبات هستی.

اطلاعات فرد و علایق او را تحلیل کن و حداکثر 6 عبارت کوتاه و کاربردی برای جست‌وجوی محصولات واقعی در دیجی‌کالا بساز.

قوانین:
- عبارت‌ها فارسی و کوتاه باشند.
- سن، جنسیت و نسبت فرد را فقط در صورت مفید بودن لحاظ کن.
- علایق را به محصولات و دسته‌بندی‌های مشخص تبدیل کن.
- عبارت‌های متنوع و مرتبط تولید کن.
- از عبارت‌های طولانی و کلی مثل «هدیه مناسب برای...» استفاده نکن.
- نام برند یا مدل خاصی را بدون دلیل نساز.
- فقط JSON معتبر با ساختار زیر برگردان:
{"queries":["عبارت اول","عبارت دوم"]}
            `.trim(),
          },
          {
            role: "user",
            content: userQueries.join("\n"),
          },
        ],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error("GapGPT API error:", response.status, errorText);

    throw new Error(`GAPGPT_API_ERROR_${response.status}`);
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("GAPGPT_EMPTY_RESPONSE");
  }

  const cleanedContent = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  const parsed = JSON.parse(cleanedContent);

  if (!Array.isArray(parsed.queries)) {
    throw new Error("GAPGPT_INVALID_QUERY_FORMAT");
  }

  const queries = parsed.queries
    .filter(
      (query: unknown): query is string =>
        typeof query === "string",
    )
    .map((query: string) => query.trim())
    .filter((query: string) => query.length >= 2)
    .slice(0, 6);

  if (queries.length === 0) {
    throw new Error("GAPGPT_NO_VALID_QUERIES");
  }

  return queries;
}

export async function GET(request: NextRequest) {
  const userQueries = request.nextUrl.searchParams
    .getAll("q")
    .map((query) => query.trim())
    .filter(Boolean)
    .slice(0, 6);

  if (userQueries.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "SEARCH_QUERY_REQUIRED",
        message: "عبارت جست‌وجو را وارد کن.",
      },
      { status: 400 },
    );
  }

  const requestedStores = request.nextUrl.searchParams.get("stores");
  const minPriceParam = request.nextUrl.searchParams.get("minPrice");
const maxPriceParam = request.nextUrl.searchParams.get("maxPrice");

let priceRange:
  | { min: number; max: number }
  | undefined;

if (minPriceParam !== null || maxPriceParam !== null) {
  const min = Number(minPriceParam);
  const max = Number(maxPriceParam);

  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min < 0 ||
    max <= 0 ||
    min > max
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_PRICE_RANGE",
        message: "بازه قیمت واردشده معتبر نیست.",
      },
      { status: 400 },
    );
  }

  priceRange = { min, max };
}

  const validStoreIds = ACTIVE_STORES.map((store) => store.id);

  const selectedStores: ProductSource[] = requestedStores
    ? requestedStores
        .split(",")
        .map((store) => store.trim())
        .filter(
          (store): store is ProductSource =>
            validStoreIds.includes(store as ProductSource),
        )
    : ["digikala"];

  if (selectedStores.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "NO_VALID_STORES",
        message: "فروشگاه معتبری برای جست‌وجو انتخاب نشده است.",
      },
      { status: 400 },
    );
  }

  try {
    let searchQueries = userQueries;
    let aiUsed = false;
    let aiError: string | null = null;

    try {
      searchQueries = await generateGiftSearchQueries(userQueries);
      aiUsed = true;
    } catch (error) {
      aiError =
        error instanceof Error ? error.message : String(error);

      console.error("Gift AI generation failed:", aiError);

      // در صورت اختلال GPT، جست‌وجوی قبلی همچنان اجرا می‌شود.
      searchQueries = userQueries;
    }

    const result = await searchProducts(
  searchQueries,
  selectedStores,
  priceRange,
);

    return NextResponse.json({
      ...result,
      ai: {
        used: aiUsed,
        model: aiUsed ? GAPGPT_MODEL : null,
        error: aiError,
        generatedQueries: searchQueries,
      },
    });
  } catch (error) {
    console.error("Product search route error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
