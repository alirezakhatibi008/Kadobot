"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Person = {
  id: number;
  name: string;
  relation: string;
  age: number | null;
  gender: string;
  city: string | null;
  interest: string;
  interestDescription: string;
  lastGift: string;
};

type Occasion = {
  id: number;
  title: string;
  type: string;
  date: string;
};

type ProductItem = {
  id?: string | number;
  title?: string;
  price?: number;
  currency?: string;
  image?: string;
  url?: string;
  reason?: string;
};

const budgetRanges = [
  { label: "کمتر از ۱ میلیون تومان", min: 0, max: 1000000 },
  { label: "۱ تا ۳ میلیون تومان", min: 1000000, max: 3000000 },
  { label: "۳ تا ۵ میلیون تومان", min: 3000000, max: 5000000 },
  { label: "۵ تا ۱۰ میلیون تومان", min: 5000000, max: 10000000 },
  { label: "بیشتر از ۱۰ میلیون تومان", min: 10000000, max: 100000000 },
];

const giftStyles = [
  { id: "practical", label: "کاربردی", desc: "چیزی که واقعاً استفاده کند", icon: "🎯" },
  { id: "emotional", label: "احساسی و خاطره‌انگیز", desc: "هدیه‌ای با ارزش عاطفی", icon: "❤️" },
  { id: "unique", label: "خاص و متفاوت", desc: "غیرتکراری و خلاقانه", icon: "✨" },
  { id: "fun", label: "سرگرم‌کننده", desc: "جذاب و هیجان‌انگیز", icon: "🎉" },
  { id: "luxury", label: "شیک و لوکس", desc: "ظاهر و حس پرستیژ", icon: "💎" },
  { id: "surprise", label: "غافلگیرم کن", desc: "انتخاب آزاد بر اساس شناخت فرد", icon: "🎁" },
];

function SmartGiftContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const personId = searchParams.get("personId");

  const [loadingPerson, setLoadingPerson] = useState(true);
  const [person, setPerson] = useState<Person | null>(null);
  const [occasion, setOccasion] = useState<Occasion | null>(null);

  // Form states
  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState<number | null>(1); // پیش‌فرض ۱ تا ۳ میلیون
  const [customBudget, setCustomBudget] = useState<string>("");
  const [budgetMode, setBudgetMode] = useState<"ranges" | "custom">("ranges");
  const [selectedStyle, setSelectedStyle] = useState<string>("surprise");

  // Results states
  const [loadingResults, setLoadingResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [results, setResults] = useState<ProductItem[]>([]);
  const [aiIdeas, setAiIdeas] = useState<any[]>([]);

  const persianNumber = (num: number) => new Intl.NumberFormat("fa-IR").format(num);

  // Load person and occasion info
  useEffect(() => {
    async function fetchPersonData() {
      if (!personId) {
        setLoadingPerson(false);
        return;
      }
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          router.push("/login");
          return;
        }

        const { data: pData, error: pError } = await supabase
          .from("people")
          .select("id, name, relationship, age, gender, city, interests, interest_description, last_gift")
          .eq("id", personId)
          .single();

        if (pError || !pData) {
          setErrorMessage("فرد مورد نظر یافت نشد.");
        } else {
          setPerson({
            id: Number(pData.id),
            name: pData.name,
            relation: pData.relationship,
            age: pData.age ?? null,
            gender: pData.gender ?? "",
            city: pData.city ?? null,
            interest: (pData.interests ?? []).join("، "),
            interestDescription: pData.interest_description ?? "",
            lastGift: pData.last_gift ?? "",
          });

          // Fetch latest upcoming occasion for this person
          const { data: oData } = await supabase
            .from("occasions")
            .select("id, title, occasion_type, date_jalali")
            .eq("person_id", personId)
            .order("id", { ascending: false })
            .limit(1);

          if (oData && oData.length > 0) {
            setOccasion({
              id: Number(oData[0].id),
              title: oData[0].title,
              type: oData[0].occasion_type,
              date: oData[0].date_jalali,
            });
          }
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("خطا در بارگذاری اطلاعات.");
      } finally {
        setLoadingPerson(false);
      }
    }

    fetchPersonData();
  }, [personId, router]);

  // Handle recommendation generation
  const handleGenerateGifts = async () => {
    if (!person) return;
    setLoadingResults(true);
    setErrorMessage("");
    setResults([]);

    let budgetText = "";
    let minPrice = 0;
    let maxPrice = 100000000;

    if (budgetMode === "ranges" && selectedBudgetIndex !== null) {
      budgetText = budgetRanges[selectedBudgetIndex].label;
      minPrice = budgetRanges[selectedBudgetIndex].min;
      maxPrice = budgetRanges[selectedBudgetIndex].max;
    } else if (budgetMode === "custom" && customBudget) {
      budgetText = `تا ${customBudget} تومان`;
      maxPrice = Number(customBudget.replace(/[^0-9]/g, "")) || 100000000;
    }

    const styleObj = giftStyles.find((s) => s.id === selectedStyle);

    try {
      // Step 1: Call API endpoint or GapGPT directly for generating ideas & search keywords
      // For robust integration, we can send a request to our own backend route or directly prompt GapGPT API
      const res = await fetch("/api/smart-gift-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person: {
            name: person.name,
            relation: person.relation,
            age: person.age,
            gender: person.gender,
            city: person.city,
            interests: person.interest,
            interestDescription: person.interestDescription,
            lastGift: person.lastGift,
          },
          occasion: occasion ? { title: occasion.title, type: occasion.type } : null,
          budget: budgetText,
          style: styleObj?.label || "غافلگیرم کن",
        }),
      });

      let searchQueries: string[] = [];

      if (res.ok) {
        const aiData = await res.json();
        if (aiData.queries && Array.isArray(aiData.queries)) {
          searchQueries = aiData.queries;
        }
        if (aiData.ideas) {
          setAiIdeas(aiData.ideas);
        }
      }

      // Fallback search queries if AI response was basic
      if (searchQueries.length === 0) {
        searchQueries = person.interest ? person.interest.split(/[,،]/).map(i => i.trim()) : ["هدیه خاص", "کادوی جذاب"];
      }

      // Step 2: Fetch products from Digikala search API
      const params = new URLSearchParams();
      searchQueries.slice(0, 5).forEach((q) => params.append("q", q));
      params.set("stores", "digikala");

      const prodRes = await fetch(`/api/product-search?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const prodResult = await prodRes.json();
      if (!prodRes.ok || !prodResult.success) {
        throw new Error(prodResult.error || "خطا در دریافت محصولات از فروشگاه.");
      }

      let fetchedProducts: ProductItem[] = Array.isArray(prodResult.products) ? prodResult.products : [];

      // Filter by max budget if price is available
      fetchedProducts = fetchedProducts.filter((p) => {
        if (!p.price) return true;
        const pToman = p.currency === "IRR" ? Number(p.price) / 10 : Number(p.price);
        return pToman <= maxPrice && pToman >= minPrice;
      });

      setResults(fetchedProducts.slice(0, 8));
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "خطایی در پردازش پیشنهاد هدیه رخ داد.");
    } finally {
      setLoadingResults(false);
    }
  };

  if (loadingPerson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          <p className="mt-2 text-sm">در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">فردی انتخاب نشده است</h2>
        <p className="mt-2 text-sm text-gray-500">لطفاً از صفحه اصلی یا داشبورد کادوبات وارد این بخش شوید.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-rose-700"
        >
          بازگشت به داشبورد
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← بازگشت به داشبورد
          </button>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
            هدیه هوشمند کادوبات 🎁
          </span>
        </div>

        {/* Person Summary Card */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">پیشنهاد هدیه برای {person.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                نسبت: <span className="font-medium text-gray-700">{person.relation}</span>
                {person.age ? ` · ${persianNumber(person.age)} سال` : ""}
                {person.city ? ` · ساکن ${person.city}` : ""}
              </p>
              {occasion && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  مناسبت پیش‌رو: {occasion.title} ({occasion.type})
                </p>
              )}
            </div>
            {person.interest && (
              <div className="max-w-xs rounded-xl bg-gray-50 p-3 text-xs text-gray-600 border border-gray-100">
                <span className="font-semibold text-gray-700 block mb-1">علایق ثبت‌شده:</span>
                {person.interest}
              </div>
            )}
          </div>
        </div>

        {/* Step 1: Budget Selection */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          تحریم‌ها و هزینه‌ها مهم است؛ بودجه هدیه چقدر است؟
          <div className="mt-4 flex gap-2 border-b pb-3">
            <button
              onClick={() => setBudgetMode("ranges")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                budgetMode === "ranges" ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              بازه‌های آماده
            </button>
            <button
              onClick={() => setBudgetMode("custom")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                budgetMode === "custom" ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              ورود دستی مبلغ
            </button>
          </div>

          {budgetMode === "ranges" ? (
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {budgetRanges.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedBudgetIndex(idx)}
                  className={`flex items-center justify-between rounded-xl border p-3.5 text-right text-sm transition ${
                    selectedBudgetIndex === idx
                      ? "border-rose-600 bg-rose-50/50 font-semibold text-rose-900 shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{range.label}</span>
                  <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedBudgetIndex === idx ? "border-rose-600 bg-rose-600 text-white text-[10px]" : "border-gray-300"}`}>
                    {selectedBudgetIndex === idx ? "✓" : ""}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">مبلغ مد نظر به تومان:</label>
              <input
                type="text"
                placeholder="مثلاً: ۲,۵۰۰,۰۰۰"
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          )}
        </div>

        {/* Step 2: Gift Style Selection */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-3">چه نوع هدیه‌ای مدنظرت است؟</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {giftStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`flex flex-col text-right rounded-2xl border p-4 transition ${
                  selectedStyle === style.id
                    ? "border-rose-600 bg-rose-50/50 shadow-sm ring-1 ring-rose-500"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-2xl mb-2">{style.icon}</span>
                <span className="font-bold text-sm text-gray-900">{style.label}</span>
                <span className="text-xs text-gray-500 mt-1">{style.desc}</span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={handleGenerateGifts}
              disabled={loadingResults}
              className="w-full rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 py-3.5 text-center text-sm font-bold text-white shadow-md hover:from-rose-700 hover:to-pink-700 disabled:opacity-50"
            >
              {loadingResults ? "در حال تحلیل هوشمند و جستجو..." : "✨ شروع جست‌وجو و پیشنهاد هدیه"}
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">
            {errorMessage}
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-1">پیشنهادهای کادوبات برای {person.name}</h2>
            <p className="text-xs text-gray-500 mb-6">نتایج استخراج‌شده از دیجی‌کالا بر اساس تحلیل هوش مصنوعی</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {results.map((product, index) => {
                const tomanPrice = product.price
                  ? product.currency === "IRR"
                    ? Math.round(product.price / 10)
                    : product.price
                  : null;

                return (
                  <article key={product.id ?? index} className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50/50 p-4 shadow-sm hover:shadow transition">
                    <div>
                      {product.image ? (
                        <img src={product.image} alt={product.title || ""} className="h-40 w-full object-contain rounded-xl bg-white mb-3 p-2" />
                      ) : (
                        <div className="flex h-40 w-full items-center justify-center rounded-xl bg-gray-100 text-3xl mb-3">🎁</div>
                      )}
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{product.title}</h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-500">دیجی‌کالا</span>
                        {tomanPrice && <span className="font-bold text-sm text-rose-600">{persianNumber(tomanPrice)} تومان</span>}
                      </div>

                      {product.url && (
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block w-full rounded-xl bg-rose-600 py-2.5 text-center text-xs font-medium text-white shadow hover:bg-rose-700 transition"
                        >
                          مشاهده و خرید ↗
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SmartGiftPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">در حال بارگذاری صفحه...</div>}>
      <SmartGiftContent />
    </Suspense>
  );
}
