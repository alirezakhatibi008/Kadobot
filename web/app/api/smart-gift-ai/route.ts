
import { NextResponse } from "next/server";

function extractJson(content: string) {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("پاسخ هوش مصنوعی ساختار JSON معتبری ندارد.");
    }

    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GAPGPT_API_KEY;

    if (!apiKey) {
      throw new Error("کلید API گپ‌جی‌پی‌تی تعریف نشده است.");
    }

    const body = await req.json();
    const { person, occasion, budget, style } = body;

    const systemPrompt = `
تو مشاور تخصصی انتخاب هدیه در پلتفرم کادوبات هستی.

با توجه به مشخصات فرد، مناسبت، بودجه و سبک انتخابی،
۳ تا ۵ ایده خلاقانه هدیه تولید کن.

برای هر ایده یک عنوان و دلیل کوتاه ارائه بده.
همچنین ۳ تا ۵ عبارت جست‌وجوی مناسب برای دیجی‌کالا تولید کن.

فقط یک شیء JSON معتبر برگردان.
هیچ متن، توضیح یا Markdown خارج از JSON ننویس.

ساختار دقیق پاسخ:

{
  "ideas": [
    {
      "title": "عنوان ایده هدیه",
      "reason": "دلیل مناسب بودن هدیه"
    }
  ],
  "queries": [
    "عبارت جستجوی اول",
    "عبارت جستجوی دوم",
    "عبارت جستجوی سوم"
  ]
}

تمام رشته‌ها باید با کوتیشن دوتایی باشند.
بین اعضای آرایه ویرگول بگذار.
ویرگول اضافه قبل از بسته شدن آرایه یا شیء قرار نده.
`;

    const userPrompt = `
مشخصات فرد گیرنده:
- نام: ${person?.name || "نامشخص"}
- نسبت: ${person?.relation || "نامشخص"}
- سن: ${person?.age || "نامشخص"}
- جنسیت: ${person?.gender || "نامشخص"}
- شهر: ${person?.city || "نامشخص"}
- علایق: ${person?.interests || "ندارد"}
- توضیحات علایق: ${person?.interestDescription || "ندارد"}
- آخرین هدیه دریافتی: ${person?.lastGift || "ندارد"}

مناسبت: ${occasion ? `${occasion.title} (${occasion.type})` : "ندارد"}
بودجه: ${budget || "نامشخص"}
سبک هدیه: ${style || "بدون ترجیح خاص"}
`;

    const response = await fetch(
      "https://api.gapgpt.app/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.5,
        }),
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("GapGPT API Error:", {
        status: response.status,
        error: result.error?.message || "Unknown API error",
      });

      throw new Error(
        result.error?.message || "ارتباط با سرویس گپ‌جی‌پی‌تی ناموفق بود."
      );
    }

    const content = result.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      throw new Error("پاسخی از هوش مصنوعی دریافت نشد.");
    }

    let data;

    try {
      data = extractJson(content);
    } catch (parseError) {
      console.error("GapGPT JSON Parse Error:", {
        message:
          parseError instanceof Error
            ? parseError.message
            : "Invalid JSON",
        contentPreview: content.slice(0, 500),
      });

      throw new Error("پاسخ هوش مصنوعی قابل پردازش نبود. دوباره تلاش کن.");
    }

    if (
      !data ||
      !Array.isArray(data.ideas) ||
      !Array.isArray(data.queries)
    ) {
      throw new Error("ساختار پاسخ هوش مصنوعی معتبر نیست.");
    }

    const ideas = data.ideas
      .filter(
        (item: any) =>
          item &&
          typeof item.title === "string" &&
          typeof item.reason === "string"
      )
      .slice(0, 5);

    const queries = data.queries
      .filter(
        (item: unknown) =>
          typeof item === "string" && item.trim().length > 0
      )
      .slice(0, 5);

    if (ideas.length === 0 || queries.length === 0) {
      throw new Error("ایده یا عبارت جست‌وجوی معتبری تولید نشد.");
    }

    return NextResponse.json({
      success: true,
      ideas,
      queries,
    });

  } catch (error) {
    console.error("AI Gift Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "خطا در پردازش هوش مصنوعی",
      },
      { status: 500 }
    );
  }
}
