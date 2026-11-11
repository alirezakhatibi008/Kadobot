import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
      const apiKey = process.env.GAPGPT_API_KEY;

    if (!apiKey) {
      throw new Error("کلید API گپ‌جی‌پی‌تی در تنظیمات پروژه تعریف نشده است.");
    }

    const body = await req.json();
    const { person, occasion, budget, style } = body;

    const systemPrompt = `تو یک مشاور تخصصی و حرفه‌ای انتخاب هدیه در پلتفرم «کادوبات» هستی.

وظیفه داری با توجه به مشخصات فرد، مناسبت، بودجه و سبک انتخابی کاربر، ۳ تا ۵ ایده خلاقانه هدیه تولید کنی و برای هرکدام بهترین عبارات جست‌وجو برای پیدا کردن محصول در دیجی‌کالا استخراج کنی.

پاسخ باید صرفاً یک شیء JSON با ساختار زیر باشد و هیچ متن اضافه‌ای نداشته باشد:

{
  "ideas": [
    {
      "title": "عنوان ایده هدیه",
      "reason": "دلیل کوتاه که چرا این هدیه برای این فرد مناسب است"
    }
  ],
  "queries": [
    "عبارت جستجوی اول در دیجی‌کالا",
    "عبارت جستجوی دوم",
    "عبارت سوم"
  ]
}`;

    const userPrompt = `
مشخصات فرد گیرنده:
- نام: ${person?.name || "نامشخص"}
- نسبت: ${person?.relation || "نامشخص"}
- سن: ${person?.age || "نامشخص"}
- جنسیت: ${person?.gender || "نامشخص"}
- شهر: ${person?.city || "نامشخص"}
- علایق: ${person?.interests || "ندارد"}
- توضیحات تکمیلی علایق: ${person?.interestDescription || "ندارد"}
- آخرین هدیه دریافتی: ${person?.lastGift || "ندارد"}

مناسبت: ${occasion ? `${occasion.title} (${occasion.type})` : "ندارد"}
بودجه مدنظر کاربر: ${budget || "نامشخص"}
سبک انتخابی هدیه: ${style || "بدون ترجیح خاص"}
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
          temperature: 0.7,
        }),
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("GapGPT API Error:", result);

      throw new Error(
        result.error?.message || "ارتباط با سرویس گپ‌جی‌پی‌تی ناموفق بود."
      );
    }

    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("پاسخی از هوش مصنوعی دریافت نشد.");
    }

    const data = JSON.parse(content);

    return NextResponse.json({
      success: true,
      ideas: data.ideas || [],
      queries: data.queries || [],
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