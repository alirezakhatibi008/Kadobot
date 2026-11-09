
"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";
import SupabaseTest from "./supabase-test";
import { supabase } from "@/lib/supabase";

type Person = {
  id: number;
  name: string;
  relation: string;
  age: number | null;
  gender: string;
  city: string | null;
  initial: string;
  color: string;
  lastGift: string;
  interest: string;
  interestDescription: string;
};

type Occasion = {
  id: number;
  title: string;
  person: string;
  relation: string;
  daysLeft: number;
  date: string;
  type: string;
  recurring?: boolean;
};

type ModalType = "person" | "occasion" | null;

type DeleteTarget =
  | { type: "person"; item: Person }
  | { type: "occasion"; item: Occasion }
  | null;

const relations = [
  "دوست",
  "همسر",
  "مادر",
  "پدر",
  "خواهر",
  "برادر",
  "همکار",
  "فرزند",
  "سایر",
];

const interestOptions = [
  "تکنولوژی و گجت",
  "کتاب و مطالعه",
  "مد و پوشاک",
  "زیبایی و مراقبت",
  "ورزش و سلامتی",
  "هنر و موسیقی",
  "سفر و طبیعت",
  "آشپزی و غذا",
  "بازی و سرگرمی",
  "دکوراسیون",
  "طلا و جواهر",
  "تجربه و تفریح",
  "هنوز نمی‌دانم",
];

const occasionTypes = [
  "تولد",
  "سالگرد ازدواج",
  "سالگرد آشنایی",
  "سالگرد دوستی",
  "روز مادر",
  "روز پدر",
  "روز زن",
  "روز مرد",
  "روز دختر",
  "روز پسر",
  "روز کودک",
  "روز معلم",
  "روز دانشجو",
  "روز پزشک",
  "روز مهندس",
  "روز پرستار",
  "روز ولنتاین",
  "عید نوروز",
  "شب یلدا",
  "چهارشنبه‌سوری",
  "فارغ‌التحصیلی",
  "ارتقای شغلی",
  "شروع شغل جدید",
  "خانه‌دار شدن",
  "سالگرد شروع همکاری",
  "مناسبت مذهبی",
  "مناسبت ملی",
  "مناسبت دلخواه",
];

const recurringTypes = new Set([
  "تولد",
  "سالگرد ازدواج",
  "سالگرد آشنایی",
  "سالگرد دوستی",
  "روز مادر",
  "روز پدر",
  "روز زن",
  "روز مرد",
  "روز دختر",
  "روز پسر",
  "روز کودک",
  "روز معلم",
  "روز دانشجو",
  "روز پزشک",
  "روز مهندس",
  "روز پرستار",
  "روز ولنتاین",
  "عید نوروز",
  "شب یلدا",
  "چهارشنبه‌سوری",
]);

function isRecurringByDefault(type: string) {
  return recurringTypes.has(type);
}

const colors = [
  "bg-rose-100 text-rose-600",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
];

const persianNumber = (value: number) =>
  new Intl.NumberFormat("fa-IR").format(value);

function getDaysLeft(
  jalaliDate: string,
  currentToday: Date,
  recurring = true,
): number {
  if (!jalaliDate) return 0;

  try {
    const selected = new DateObject({
      date: jalaliDate,
      calendar: persian,
      locale: persian_fa,
    });

    const today = new DateObject({
      date: currentToday,
      calendar: persian,
      locale: persian_fa,
    });

    const target = new DateObject({
      date: selected.toDate(),
      calendar: persian,
      locale: persian_fa,
    });

    if (recurring) {
      target.set("year", today.year);

      if (
        target.toDate().setHours(0, 0, 0, 0) <
        today.toDate().setHours(0, 0, 0, 0)
      ) {
        target.add(1, "year");
      }
    }

    const targetDate = target.toDate();
    const todayDate = today.toDate();

    const targetDay = Date.UTC(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
    );

    const currentDay = Date.UTC(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate(),
    );

    return Math.round((targetDay - currentDay) / 86400000);
  } catch {
    return 0;
  }
}

function formatJalaliDate(date: string): string {
  if (!date) return "تاریخ مشخص نشده";

  try {
    return new DateObject({
      date,
      calendar: persian,
      locale: persian_fa,
    }).format("D MMMM YYYY");
  } catch {
    return date;
  }
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    gift: (
      <>
        <rect x="3" y="9" width="18" height="12" rx="2" />
        <path d="M12 9v12M3 13h18M12 9H7.5a2.5 2.5 0 1 1 2.5-2.5V9Zm0 0h4.5A2.5 2.5 0 1 0 14 6.5V9Z" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        <path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    chevron: <path d="m7 10 5 5 5-5" />,
    login: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
      </>
    ),
    arrow: <path d="M19 12H5m6 6-6-6 6-6" />,
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    ),
    edit: (
      <path d="m16 4 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l-.8 5Z" />
    ),
    trash: (
      <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
    ),
    close: <path d="m18 6-12 12M6 6l12 12" />,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.gift}
    </svg>
  );
}

function RelationBadge({ relation }: { relation: string }) {
  const styles: Record<string, string> = {
    خواهر: "bg-rose-100 text-rose-700 border-rose-200",
    برادر: "bg-indigo-100 text-indigo-700 border-indigo-200",
    دوست: "bg-sky-100 text-sky-700 border-sky-200",
    همکار: "bg-amber-100 text-amber-800 border-amber-200",
    مادر: "bg-pink-100 text-pink-700 border-pink-200",
    پدر: "bg-violet-100 text-violet-700 border-violet-200",
    همسر: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${
        styles[relation] ??
        "bg-teal-100 text-teal-800 border-teal-200"
      }`}
    >
      {relation}
    </span>
  );
}

function GiftIllustration() {
  return (
    <div className="relative mx-auto h-[270px] w-full max-w-[410px] sm:h-[330px]">
      <style jsx global>{`
        @keyframes kado-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-9px);
          }
        }
        .kado-float {
          animation: kado-float 4s ease-in-out infinite;
        }

        .kado-modern-scroll {
          scrollbar-width: thin;
          scrollbar-color: #a9c7b9 transparent;
          scroll-snap-type: y proximity;
          -webkit-overflow-scrolling: touch;
        }

        .kado-modern-scroll::-webkit-scrollbar {
          width: 5px;
        }

        .kado-modern-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .kado-modern-scroll::-webkit-scrollbar-thumb {
          background: #a9c7b9;
          border-radius: 999px;
        }

        .kado-modern-scroll::-webkit-scrollbar-thumb:hover {
          background: #7fa997;
        }

        @media (prefers-reduced-motion: reduce) {
          .kado-float {
            animation: none;
          }
        }
      `}</style>

      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF9C91]/25 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[245px] w-[245px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
      <div className="absolute left-[14%] top-[17%] text-3xl text-[#FFD68A]">
        ✦
      </div>
      <div className="absolute right-[13%] top-[20%] text-xl text-[#FFA99C]">
        ✧
      </div>
      <div className="absolute bottom-[16%] left-[20%] text-2xl text-[#D6C5FF]">
        ✧
      </div>
      <div className="absolute bottom-[17%] right-[17%] text-3xl text-[#FFD68A]">
        ✦
      </div>

      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-[43%] -rotate-6">
        <div className="relative h-[155px] w-[165px] rounded-[22px] bg-gradient-to-br from-[#FFB09D] via-[#F77E88] to-[#E85D78] shadow-[0_30px_55px_rgba(8,15,39,0.35)] sm:h-[180px] sm:w-[190px]">
          <div className="absolute left-1/2 top-0 h-full w-[27px] -translate-x-1/2 bg-[#FFE4A7]" />
          <div className="absolute left-0 top-[42%] h-[27px] w-full bg-[#FFF0C6]" />
          <div className="absolute -left-[9px] -top-[22px] h-[38px] w-[183px] rounded-xl bg-gradient-to-r from-[#FFB6A1] via-[#FF8E96] to-[#F16F85] shadow-lg sm:-left-[11px] sm:-top-[25px] sm:h-[43px] sm:w-[212px]" />
          <div className="absolute -top-[56px] left-1/2 z-20 flex -translate-x-1/2 items-end">
            <div className="h-[36px] w-[48px] -rotate-[30deg] rounded-[80%_20%_70%_30%] border-[5px] border-[#FFE6A8] bg-[#F6C978]" />
            <div className="-ml-2 h-[36px] w-[48px] rotate-[30deg] rounded-[20%_80%_30%_70%] border-[5px] border-[#FFE6A8] bg-[#F6C978]" />
          </div>
          <div className="absolute bottom-4 right-4 text-2xl text-white">♥</div>
        </div>
      </div>

      <div className="kado-float absolute right-0 top-[13%] z-20 rounded-2xl border border-white/20 bg-white/95 p-3 shadow-xl sm:right-[-3%] sm:p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0EA] text-[#E87872]">
            <Icon name="calendar" size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#A18C89]">مناسبت نزدیک</p>
            <p className="mt-1 text-xs font-black text-[#244B49]">تولد مریم</p>
          </div>
        </div>
        <div className="mt-2 rounded-lg bg-[#FFF2ED] px-2 py-1 text-center text-[10px] font-bold text-[#DE756B]">
          یک مناسبت قشنگ
        </div>
      </div>

      <div className="kado-float absolute bottom-[10%] left-0 z-20 rounded-2xl border border-white/20 bg-white/95 p-3 shadow-xl sm:left-[-2%] sm:p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0EAFE] text-[#8D70D9]">
            <Icon name="sparkles" size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#A18C89]">
              پیشنهاد کادوبات
            </p>
            <p className="mt-1 text-xs font-black text-[#514477]">
              یک هدیه خاص!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [currentToday, setCurrentToday] = useState<Date | null>(null);

  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [userFirstName, setUserFirstName] = useState<string | null>(null);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  // وضعیت پیشنهاد هدیه
  const [giftPersonPickerOpen, setGiftPersonPickerOpen] = useState(false);
  const [giftResultsOpen, setGiftResultsOpen] = useState(false);
  const [selectedGiftPerson, setSelectedGiftPerson] = useState<Person | null>(null);
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftProducts, setGiftProducts] = useState<any[]>([]);
  const [giftCurrentPage, setGiftCurrentPage] = useState(1);

const giftProductsPerPage = 8;

const giftTotalPages = Math.ceil(
  giftProducts.length / giftProductsPerPage
);

const giftStartIndex =
  (giftCurrentPage - 1) * giftProductsPerPage;

const giftVisibleProducts = giftProducts.slice(
  giftStartIndex,
  giftStartIndex + giftProductsPerPage
);
  const [giftError, setGiftError] = useState("");
  const [giftOptionsOpen, setGiftOptionsOpen] = useState(false);
const [giftBudget, setGiftBudget] = useState("");
const [giftStyle, setGiftStyle] = useState("");
const [giftBudgetCustom, setGiftBudgetCustom] = useState("");
const [giftBudgetExpandPending, setGiftBudgetExpandPending] = useState(false);
const [giftBudgetExpanded, setGiftBudgetExpanded] = useState(false);

  const [personForm, setPersonForm] = useState({
    name: "",
    relation: "دوست",
    age: "",
    gender: "",
    interest: [] as string[],
    interestDescription: "",
    lastGift: "",
  });

  const [occasionForm, setOccasionForm] = useState({
    title: "",
    person: "",
    relation: "دوست",
    date: "",
    type: "تولد",
    recurring: true,
  });

  const isLoggedIn = Boolean(userEmail);

  // تعیین تاریخ امروز
  useEffect(() => {
    setCurrentToday(new Date());
  }, []);

  // دریافت اطلاعات کاربر، افراد و مناسبت‌ها از Supabase
  useEffect(() => {
    let active = true;

    async function loadPeople(userId: string) {
      const { data, error } = await supabase
        .from("people")
        .select("id, name, relationship, age, gender, city, interests, interest_description, last_gift")
        .eq("user_id", userId)
        .order("id", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("خطا در دریافت افراد:", error.message);
        alert("دریافت اطلاعات افراد با مشکل مواجه شد.");
        return;
      }

      const loadedPeople: Person[] = (data ?? []).map((item, index) => ({
        id: Number(item.id),
        name: item.name,
        relation: item.relationship,
        age: item.age ?? null,
        gender: item.gender ?? "",
        city: item.city ?? null,
        initial: item.name.charAt(0),
        color: colors[index % colors.length],
        interest: (item.interests ?? []).join("، "),
        interestDescription: item.interest_description ?? "",
        lastGift: item.last_gift ?? "",
      }));

      setPeople(loadedPeople);

      await loadOccasions(userId, loadedPeople);
    }

    async function loadOccasions(userId: string, loadedPeople: Person[]) {
      const { data, error } = await supabase
        .from("occasions")
        .select(
          "id, title, person_id, occasion_type, date_jalali, is_recurring",
        )
        .eq("user_id", userId)
        .order("id", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("خطا در دریافت مناسبت‌ها:", error.message);
        alert("دریافت مناسبت‌ها با مشکل مواجه شد.");
        return;
      }

      const loadedOccasions: Occasion[] = (data ?? []).map((item) => {
        const person = loadedPeople.find(
          (person) => person.id === Number(item.person_id),
        );

        return {
          id: Number(item.id),
          title: item.title,
          person: person?.name ?? "فرد حذف‌شده",
          relation: person?.relation ?? "",
          date: item.date_jalali,
          daysLeft: getDaysLeft(
            item.date_jalali,
            new Date(),
            item.is_recurring,
          ),
          type: item.occasion_type,
          recurring: item.is_recurring,
        };
      });

      setOccasions(loadedOccasions);
    }

    function updateUserInfo(
      user: {
        id: string;
        email?: string;
        user_metadata?: {
          first_name?: string;
          last_name?: string;
        };
      } | null,
    ) {
      if (!user) {
        setUserEmail(null);
        setUserName(null);
        setUserFirstName(null);
        setPeople([]);
        setOccasions([]);
        return;
      }

      setUserEmail(user.email ?? null);

      const firstName = user.user_metadata?.first_name?.trim() ?? "";
      const lastName = user.user_metadata?.last_name?.trim() ?? "";

      setUserName(`${firstName} ${lastName}`.trim() || null);
      setUserFirstName(firstName || null);

      void loadPeople(user.id);
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (active) {
        updateUserInfo(user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      Promise.resolve().then(() => {
        if (active) {
          updateUserInfo(session?.user ?? null);
        }
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // خروج از حساب
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("خروج از حساب انجام نشد. لطفاً دوباره تلاش کن.");
      return;
    }

    setProfileOpen(false);
    window.location.href = "/login";
  }

  // جستجوی افراد
  const filteredPeople = useMemo(
    () =>
      people.filter((person) =>
        `${person.name} ${person.relation} ${person.interest}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [people, search],
  );

  // جستجوی مناسبت‌ها
  const filteredOccasions = useMemo(
    () =>
      occasions.filter((occasion) =>
        `${occasion.title} ${occasion.person} ${occasion.type}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [occasions, search],
  );
    // تعیین ترتیب هوشمند بخش‌های داشبورد
  const upcomingOccasions = useMemo(
    () =>
      occasions.filter(
        (occasion) =>
          occasion.daysLeft >= 0 && occasion.daysLeft <= 30,
      ),
    [occasions],
  );

 const showPeopleFirst =
  people.length === 0 ||
  (occasions.length > 0 && upcomingOccasions.length === 0);
    // انتخاب فرد برای پیشنهاد هدیه
  const handleGiftRecommendation = (person: Person) => {
    if (!isLoggedIn) {
      window.location.href = "/signup";
      return;
    }

    setSelectedGiftPerson(person);
    setGiftPersonPickerOpen(false);
    setGiftResultsOpen(false);
    setGiftLoading(false);
    setGiftError("");
    setGiftProducts([]);
    setGiftCurrentPage(1);

    setGiftBudget("");
    setGiftStyle("");
    setGiftBudgetCustom("");

    setGiftOptionsOpen(true);
  };

  // جست‌وجوی محصولات پیشنهادی
  const searchGiftProducts = async (
  expandBudget = giftBudgetExpanded,
) => {
    const person = selectedGiftPerson;

    if (!person) {
      setGiftError("ابتدا یک فرد را انتخاب کن.");
      return;
    }

   setGiftOptionsOpen(false);
setGiftResultsOpen(true);
setGiftLoading(true);
setGiftError("");
setGiftProducts([]);
setGiftCurrentPage(1);

if (!expandBudget) {
  setGiftBudgetExpanded(false);
  setGiftBudgetExpandPending(false);
}

    const interestSearchMap: Record<string, string[]> = {
      "تکنولوژی و گجت": ["گجت هوشمند", "لوازم جانبی موبایل"],
      "کتاب و مطالعه": ["کتاب", "چراغ مطالعه"],
      "مد و پوشاک": ["کیف", "اکسسوری"],
      "زیبایی و مراقبت": ["لوازم مراقبت پوست", "ست مراقبت شخصی"],
      "ورزش و سلامتی": ["لوازم ورزشی", "تجهیزات ورزشی"],
      "هنر و موسیقی": ["لوازم هنری", "هدفون"],
      "سفر و طبیعت": ["لوازم سفر", "قمقمه"],
      "آشپزی و غذا": ["لوازم آشپزخانه", "ابزار آشپزی"],
      "بازی و سرگرمی": ["بازی فکری", "لوازم سرگرمی"],
      "دکوراسیون": ["وسایل دکوری", "چراغ دکوراتیو"],
      "طلا و جواهر": ["زیورآلات", "اکسسوری"],
      "تجربه و تفریح": ["بازی فکری", "لوازم تفریح"],
    };

    const queries: string[] = [];

    const interests = person.interest
      .split(/[,،]/)
      .map((item) => item.trim())
      .filter(Boolean);

    interests.forEach((interest) => {
      const mappedQueries = interestSearchMap[interest];

      if (mappedQueries) {
        queries.push(...mappedQueries);
      } else if (interest !== "هنوز نمی‌دانم") {
        queries.push(interest);
      }
    });

    const descriptionQueries = person.interestDescription
      .split(/[،,؛;.!؟\n]+/)
      .map((item) => item.trim())
      .filter((item) => item.length >= 2);

    queries.push(...descriptionQueries);

    const uniqueQueries = Array.from(
      new Set(queries.map((item) => item.trim()).filter(Boolean)),
    ).slice(0, 6);

    if (uniqueQueries.length === 0) {
      uniqueQueries.push("هدیه کاربردی", "هدیه خاص", "لوازم شخصی");
    }

    try {
     const params = new URLSearchParams();

uniqueQueries.forEach((query) => {
  params.append("q", query);
});

params.set("stores", "digikala");

// تعیین محدوده بودجه بر اساس انتخاب کاربر
let minPrice = 0;
let maxPrice = 0;

switch (giftBudget) {
  case "under1":
    minPrice = 0;
    maxPrice = expandBudget ? 1_300_000 : 1_000_000;
    break;

  case "1to3":
    minPrice = 1_000_000;
    maxPrice = expandBudget ? 3_900_000 : 3_000_000;
    break;

  case "3to5":
    minPrice = 3_000_000;
    maxPrice = expandBudget ? 6_500_000 : 5_000_000;
    break;

  case "5to10":
    minPrice = 5_000_000;
    maxPrice = expandBudget ? 13_000_000 : 10_000_000;
    break;

  case "above10":
    minPrice = 10_000_000;
    maxPrice = 1_000_000_000_000;
    break;

  case "custom": {
    const amount = Number(giftBudgetCustom);

    minPrice = Math.round(amount * 0.9);
    maxPrice = Math.round(
      amount * (expandBudget ? 1.4 : 1.1),
    );
    break;
  }

  default:
    throw new Error("لطفاً بودجه هدیه را انتخاب کن.");
}

params.set("minPrice", String(minPrice));
params.set("maxPrice", String(maxPrice));

      const response = await fetch(
        `/api/product-search?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "جست‌وجوی محصولات با مشکل مواجه شد.",
        );
      }

      const products = Array.isArray(result.products)
        ? result.products
        : [];

      setGiftProducts(products.slice(0, 20));

      if (products.length === 0) {
  setGiftBudgetExpandPending(true);
  setGiftBudgetExpanded(false);
  setGiftError(
    "در بودجه انتخاب‌شده محصول تأییدشده‌ای پیدا نشد. آیا مایل هستی با بودجه بالاتر دوباره جست‌وجو کنیم؟",
  );
} else {
  setGiftBudgetExpandPending(false);
  setGiftBudgetExpanded(false);
}
    } catch (error) {
      console.error("خطا در پیشنهاد هدیه:", error);

      setGiftError(
        error instanceof Error
          ? error.message
          : "ارتباط با سرویس جست‌وجوی هدیه برقرار نشد.",
      );
    } finally {
      setGiftLoading(false);
    }
  };

  const openGiftPersonPicker = () => {
    if (!isLoggedIn) { window.location.href = "/signup"; return; }
    if (people.length === 0) { alert("برای دریافت پیشنهاد هدیه، ابتدا یک فرد به فهرست افراد اضافه کن."); return; }
    setGiftPersonPickerOpen(true);
  };

  // باز کردن فرم فرد
  const openPersonModal = (person?: Person) => {
    setEditingId(person?.id ?? null);

    setPersonForm(
      person
        ? {
            name: person.name,
            relation: person.relation,
            age: person.age?.toString() ?? "",
            gender: person.gender,
            interest: person.interest
              ? person.interest.split(/[,،]/).map((item) => item.trim()).filter(Boolean)
              : [],
            interestDescription: person.interestDescription ?? "",
            lastGift: person.lastGift,
          }
        : {
            name: "",
            relation: "دوست",
            age: "",
            gender: "",
            interest: [],
            interestDescription: "",
            lastGift: "",
          },
    );

    setModalType("person");
  };

  // باز کردن فرم مناسبت
  const openOccasionModal = (occasion?: Occasion) => {
    if (!occasion && people.length === 0) {
      alert("ابتدا یک فرد به فهرست افراد اضافه کن.");
      return;
    }

    setEditingId(occasion?.id ?? null);

    if (occasion) {
      setOccasionForm({
        title: occasion.title,
        person: occasion.person,
        relation: occasion.relation,
        date: occasion.date,
        type: occasion.type,
        recurring:
          occasion.recurring ?? isRecurringByDefault(occasion.type),
      });
    } else {
      setOccasionForm({
        title: people[0].name,
        person: people[0].name,
        relation: people[0].relation,
        date: "",
        type: "تولد",
        recurring: true,
      });
    }

    setModalType("occasion");
  };

  // ذخیره و ویرایش افراد در Supabase
  const savePerson = async () => {
    if (!personForm.name.trim()) {
      alert("لطفاً نام و نام خانوادگی فرد را وارد کن.");
      return;
    }

    if (!personForm.relation.trim()) {
      alert("لطفاً نسبت فرد با خودت را انتخاب کن.");
      return;
    }

    const age = Number(personForm.age);
    if (
      !personForm.age.trim() ||
      !Number.isInteger(age) ||
      age < 1 ||
      age > 120
    ) {
      alert("لطفاً سن معتبر بین ۱ تا ۱۲۰ سال وارد کن.");
      return;
    }

    if (!personForm.gender) {
      alert("لطفاً جنسیت فرد را انتخاب کن.");
      return;
    }

    if (personForm.interest.length === 0) {
      alert("لطفاً حداقل یک علاقه‌مندی انتخاب کن یا گزینه «هنوز نمی‌دانم» را بزن.");
      return;
    }

    const isNewPerson = editingId === null;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("برای ذخیره اطلاعات ابتدا وارد حساب کاربری شوید.");
      return;
    }

    const interests = personForm.interest;

    const personData = {
      name: personForm.name.trim(),
      relationship: personForm.relation,
      age,
      gender: personForm.gender,
      interests,
      interest_description: personForm.interestDescription.trim() || null,
      last_gift: personForm.lastGift.trim() || null,
    };

    let result;

    if (!isNewPerson) {
      result = await supabase
        .from("people")
        .update(personData)
        .eq("id", editingId)
        .eq("user_id", user.id)
        .select("id, name, relationship, age, gender, city, interests, interest_description, last_gift")
        .single();
    } else {
      result = await supabase
        .from("people")
        .insert({
          ...personData,
          user_id: user.id,
        })
        .select("id, name, relationship, age, gender, city, interests, interest_description, last_gift")
        .single();
    }

    if (result.error) {
      console.error("خطا در ذخیره فرد:", result.error.message);
      alert("ذخیره اطلاعات با مشکل مواجه شد.");
      return;
    }

    const savedPerson: Person = {
      id: Number(result.data.id),
      name: result.data.name,
      relation: result.data.relationship,
      age: result.data.age,
      gender: result.data.gender,
      city: result.data.city ?? null,
      initial: result.data.name.charAt(0),
      color: isNewPerson
        ? colors[people.length % colors.length]
        : people.find((person) => person.id === editingId)?.color ??
          colors[0],
      interest: (result.data.interests ?? []).join("، "),
      interestDescription: result.data.interest_description ?? "",
      lastGift: result.data.last_gift ?? "",
    };

    if (isNewPerson) {
      setPeople((prev) => [savedPerson, ...prev]);

      setEditingId(null);

      // باز کردن خودکار فرم مناسبت با نام و نسبت فرد تازه ثبت‌شده
      setOccasionForm({
        title: "تولد",
        person: savedPerson.name,
        relation: savedPerson.relation,
        date: "",
        type: "تولد",
        recurring: true,
      });

      setModalType("occasion");
    } else {
      setPeople((prev) =>
        prev.map((person) =>
          person.id === editingId ? savedPerson : person,
        ),
      );

      // به‌روزرسانی نام و نسبت فرد در مناسبت‌های مرتبط
      setOccasions((prev) =>
        prev.map((occasion) =>
          occasion.person ===
          people.find((person) => person.id === editingId)?.name
            ? {
                ...occasion,
                person: savedPerson.name,
                relation: savedPerson.relation,
              }
            : occasion,
        ),
      );

      setModalType(null);
    }
  };

  // ذخیره و ویرایش مناسبت‌ها در Supabase
  const saveOccasion = async () => {
    if (!occasionForm.person.trim()) {
      alert("نام فرد مشخص نشده است.");
      return;
    }

    if (!occasionForm.date) {
      alert("لطفاً تاریخ مناسبت را از تقویم انتخاب کن.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("برای ذخیره مناسبت ابتدا وارد حساب کاربری شو.");
      return;
    }

    const selectedPerson = people.find(
      (person) => person.name === occasionForm.person.trim(),
    );

    if (!selectedPerson) {
      alert("فرد موردنظر در فهرست افراد پیدا نشد.");
      return;
    }

    const occasionData = {
      user_id: user.id,
      person_id: selectedPerson.id,
      title: occasionForm.type,
      occasion_type: occasionForm.type,
      date_jalali: occasionForm.date,
      is_recurring: occasionForm.recurring,
    };

    let result;

    if (editingId !== null) {
      result = await supabase
        .from("occasions")
        .update(occasionData)
        .eq("id", editingId)
        .eq("user_id", user.id)
        .select("id")
        .single();
    } else {
      result = await supabase
        .from("occasions")
        .insert(occasionData)
        .select("id")
        .single();
    }

    if (result.error) {
      console.error("خطا در ذخیره مناسبت:", result.error.message);
      alert("ذخیره مناسبت با مشکل مواجه شد.");
      return;
    }

    const occasion: Occasion = {
      id: Number(result.data.id),
      title: occasionForm.type,
      person: selectedPerson.name,
      relation: selectedPerson.relation,
      date: occasionForm.date,
      daysLeft: currentToday
        ? getDaysLeft(
            occasionForm.date,
            currentToday,
            occasionForm.recurring,
          )
        : 0,
      type: occasionForm.type,
      recurring: occasionForm.recurring,
    };

    setOccasions((current) =>
      editingId !== null
        ? current.map((item) =>
            item.id === editingId ? occasion : item,
          )
        : [...current, occasion],
    );

    setEditingId(null);
    setModalType(null);
  };

  // حذف افراد و مناسبت‌ها
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("برای حذف اطلاعات ابتدا وارد حساب کاربری شو.");
      return;
    }

    if (deleteTarget.type === "person") {
      const { error } = await supabase
        .from("people")
        .delete()
        .eq("id", deleteTarget.item.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("خطا در حذف فرد:", error.message);
        alert("حذف فرد با مشکل مواجه شد.");
        return;
      }

      setPeople((current) =>
        current.filter((item) => item.id !== deleteTarget.item.id),
      );
    } else {
      const { error } = await supabase
        .from("occasions")
        .delete()
        .eq("id", deleteTarget.item.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("خطا در حذف مناسبت:", error.message);
        alert("حذف مناسبت با مشکل مواجه شد.");
        return;
      }

      setOccasions((current) =>
        current.filter((item) => item.id !== deleteTarget.item.id),
      );
    }

    setDeleteTarget(null);
  };

  // نمایش روزهای باقی‌مانده
  const daysLabel = (occasion: Occasion) => {
    if (!currentToday) return "...";

    const recurring =
      occasion.recurring ?? isRecurringByDefault(occasion.type);

    const days = getDaysLeft(occasion.date, currentToday, recurring);

    if (days === 0) return "امروز";
    if (days > 0) return `${persianNumber(days)} روز دیگر`;

    return `${persianNumber(Math.abs(days))} روز گذشته`;
  };

  return (
    <>
    {giftPersonPickerOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setGiftPersonPickerOpen(false)}>
        <div dir="rtl" className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between">
            <div><h2 className="text-lg font-black text-[#173F40]">برای چه کسی هدیه می‌خواهی؟</h2><p className="mt-1 text-xs text-[#819087]">یکی از افراد ثبت‌شده را انتخاب کن.</p></div>
            <button onClick={() => setGiftPersonPickerOpen(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="بستن">✕</button>
          </div>
          <div className="max-h-[55vh] space-y-2 overflow-y-auto">
            {people.map((person) => (
              <button key={person.id} onClick={() => handleGiftRecommendation(person)} className="flex w-full items-center justify-between rounded-2xl border border-[#E8EFEB] p-3 text-right transition hover:border-[#A9C9B4] hover:bg-[#F7FAF7]">
                <span className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl font-black ${person.color}`}>{person.initial}</span><span><span className="block text-sm font-bold text-[#354C43]">{person.name}</span><span className="mt-1 block text-[11px] text-[#8A9A91]">{person.relation}{person.age ? ` · ${persianNumber(person.age)} سال` : ""}</span></span></span>
                <Icon name="chevron-left" size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
    
{giftOptionsOpen && (
  <div
    className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4"
    onClick={() => setGiftOptionsOpen(false)}
  >
    <div
      dir="rtl"
      className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#173F40]">
            انتخاب مشخصات هدیه
          </h2>
          <p className="mt-1 text-xs text-[#819087]">
            هدیه‌ای مناسب برای {selectedGiftPerson?.name} پیدا کنیم.
          </p>
        </div>
        <button
          onClick={() => setGiftOptionsOpen(false)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          aria-label="بستن"
        >
          ✕
        </button>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-sm font-black text-[#354C43]">
          بودجه موردنظرت چقدره؟
        </h3>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { id: "under1", label: "زیر ۱ میلیون" },
            { id: "1to3", label: "۱ تا ۳ میلیون" },
            { id: "3to5", label: "۳ تا ۵ میلیون" },
            { id: "5to10", label: "۵ تا ۱۰ میلیون" },
            { id: "above10", label: "بالای ۱۰ میلیون" },
            { id: "custom", label: "مبلغ دلخواه" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setGiftBudget(item.id)}
              className={`rounded-xl border p-3 text-xs font-bold transition ${
                giftBudget === item.id
                  ? "border-[#159B83] bg-[#E8F7F0] text-[#137B68]"
                  : "border-[#E8EFEB] text-[#52665B] hover:bg-[#F7FAF7]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {giftBudget === "custom" && (
          <div className="mt-3">
            <label className="mb-2 block text-xs font-bold text-[#52665B]">
              مبلغ موردنظر به تومان
            </label>
            <input
              type="number"
              min="1"
              value={giftBudgetCustom}
              onChange={(event) => setGiftBudgetCustom(event.target.value)}
              placeholder="مثلاً ۲۵۰۰۰۰۰"
              className="w-full rounded-xl border border-[#DCE9E1] p-3 text-sm outline-none focus:border-[#159B83]"
            />
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-sm font-black text-[#354C43]">
          چه سبکی از هدیه رو ترجیح می‌دی؟
        </h3>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            "کاربردی",
            "احساسی و خاطره‌انگیز",
            "خاص و متفاوت",
            "سرگرم‌کننده",
            "شیک و لوکس",
            "غافلگیرم کن",
          ].map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setGiftStyle(style)}
              className={`rounded-xl border p-3 text-xs font-bold transition ${
                giftStyle === style
                  ? "border-[#159B83] bg-[#E8F7F0] text-[#137B68]"
                  : "border-[#E8EFEB] text-[#52665B] hover:bg-[#F7FAF7]"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

    <button
  type="button"
  disabled={
    !giftBudget ||
    !giftStyle ||
    (giftBudget === "custom" &&
      (!giftBudgetCustom || Number(giftBudgetCustom) <= 0))
  }
  onClick={() => void searchGiftProducts()}
  className="mt-2 w-full rounded-xl bg-[#173F40] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#245957] disabled:cursor-not-allowed disabled:opacity-40"
>
  پیدا کردن هدیه
</button>
    </div>
  </div>
)}


    {giftResultsOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-3 sm:p-5" onClick={() => setGiftResultsOpen(false)}>
        <div dir="rtl" className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-[#E8EFEB] p-5"><div><h2 className="text-lg font-black text-[#173F40]">پیشنهاد هدیه برای {selectedGiftPerson?.name}</h2><p className="mt-1 text-xs text-[#819087]">نتایج جست‌وجوی محصولات دیجی‌کالا</p></div><button onClick={() => setGiftResultsOpen(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="بستن">✕</button></div>
          <div className="max-h-[calc(90vh-85px)] overflow-y-auto p-5">
            {giftLoading ? (
              <div className="flex flex-col items-center justify-center py-14 text-center"><div className="mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#DCE9E1] border-t-[#173F40]"/><p className="text-sm font-bold text-[#35564B]">دارم هدیه‌های مناسب رو پیدا می‌کنم…</p><p className="mt-2 text-xs text-[#8A9A91]">ممکن است چند لحظه طول بکشد.</p></div>
           ) : giftError ? (
  <div className="rounded-2xl bg-[#FFF7F3] p-5 text-center text-sm leading-7 text-[#986A5B]">
    <p>{giftError}</p>

    {giftBudgetExpandPending && (
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            setGiftBudgetExpandPending(false);
            setGiftBudgetExpanded(true);
            setGiftError("");
            searchGiftProducts(true);
          }}
          className="rounded-xl bg-[#173F40] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#245B58]"
        >
          بله، با بودجه بالاتر جست‌وجو کن
        </button>

        <button
          onClick={() => {
            setGiftBudgetExpandPending(false);
            setGiftError("");
          }}
          className="rounded-xl border border-[#E8DCD5] bg-white px-5 py-3 text-xs font-bold text-[#986A5B] transition hover:bg-[#FFF1EA]"
        >
          فعلاً نه
        </button>
      </div>
    )}
  </div>
) : giftProducts.length === 0 ? (
  <p className="py-10 text-center text-sm text-[#819087]">
    نتیجه‌ای برای نمایش وجود ندارد.
  </p>
) : (
  <>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {giftVisibleProducts.map((product, index) => (
        <article
          key={product.id ?? product.url ?? index}
          className="flex gap-3 rounded-2xl border border-[#E8EFEB] p-3"
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.title || ""}
              className="h-24 w-24 shrink-0 rounded-xl bg-gray-50 object-contain"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[#F3F6F2] text-2xl">
              🎁
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-xs font-bold leading-6 text-[#354C43]">
              {product.title}
            </h3>

            {product.price != null && (
              <p className="mt-2 text-xs font-black text-[#D66F91]">
                {persianNumber(
                  Math.round(
                    Number(product.price) /
                      (product.currency === "IRR" ? 10 : 1),
                  ),
                )}{" "}
                تومان
              </p>
            )}

            <p className="mt-1 text-[10px] text-[#8A9A91]">
              دیجی‌کالا
            </p>

            {product.url && (
              <a
                href={product.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-[11px] font-bold text-[#267C68] underline"
              >
                مشاهده و خرید
              </a>
            )}
          </div>
        </article>
      ))}
    </div>

    {giftTotalPages > 1 && (
      <div className="mt-6 border-t border-[#E8EFEB] pt-5">
        <p className="mb-4 text-center text-xs text-[#819087]">
          نمایش {persianNumber(giftStartIndex + 1)} تا{" "}
          {persianNumber(
            Math.min(
              giftStartIndex + giftProductsPerPage,
              giftProducts.length,
            ),
          )}{" "}
          از {persianNumber(giftProducts.length)} محصول
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() =>
              setGiftCurrentPage((page) => Math.max(1, page - 1))
            }
            disabled={giftCurrentPage === 1}
            className="rounded-xl border border-[#DCE9E1] px-4 py-2 text-xs font-bold text-[#35564B] disabled:cursor-not-allowed disabled:opacity-40"
          >
            قبلی
          </button>

          {Array.from(
            { length: giftTotalPages },
            (_, index) => index + 1,
          ).map((page) => (
            <button
              key={page}
              onClick={() => setGiftCurrentPage(page)}
              className={`h-9 min-w-9 rounded-xl px-3 text-xs font-bold transition ${
                giftCurrentPage === page
                  ? "bg-[#173F40] text-white"
                  : "border border-[#DCE9E1] text-[#35564B] hover:bg-[#F3F6F2]"
              }`}
            >
              {persianNumber(page)}
            </button>
          ))}

          <button
            onClick={() =>
              setGiftCurrentPage((page) =>
                Math.min(giftTotalPages, page + 1),
              )
            }
            disabled={giftCurrentPage === giftTotalPages}
            className="rounded-xl border border-[#DCE9E1] px-4 py-2 text-xs font-bold text-[#35564B] disabled:cursor-not-allowed disabled:opacity-40"
          >
            بعدی
          </button>
        </div>
      </div>
    )}
  </>
)}

<div className="mt-5 flex justify-between gap-2">
  <button
    onClick={() => {
      setGiftResultsOpen(false);
      setGiftPersonPickerOpen(true);
    }}
    className="rounded-xl border border-[#DCE9E1] px-4 py-2.5 text-xs font-bold text-[#35564B]"
  >
    انتخاب فرد دیگر
  </button>

  <button
    onClick={() => setGiftResultsOpen(false)}
    className="rounded-xl bg-[#173F40] px-5 py-2.5 text-xs font-bold text-white"
  >
    بستن
  </button>
</div>
          </div>
        </div>
        </div>
      )}

    <main className="min-h-screen overflow-x-hidden bg-[#FFF9F6] text-[#173F40]">
      {/* فرم افزودن و ویرایش */}
      {modalType && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#102D2D]/55 p-4 backdrop-blur-sm"
          onClick={() => setModalType(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="my-auto max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-white/70 bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#E87872]">کادوبات</p>
                <h2 className="mt-1 text-xl font-black text-[#173F40]">
                  {modalType === "person"
                    ? editingId
                      ? "ویرایش اطلاعات فرد"
                      : "افزودن آدم خاص"
                    : editingId
                      ? "ویرایش مناسبت"
                      : "افزودن مناسبت جدید"}
                </h2>
              </div>

              <button
                onClick={() => setModalType(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F3F0] text-[#8A9B97] hover:bg-[#FCE8E3]"
                aria-label="بستن"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {modalType === "person" ? (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[#526D65]">
                  نام و نام خانوادگی <span className="text-rose-500">*</span>
                  <input
                    autoFocus
                    required
                    value={personForm.name}
                    onChange={(e) =>
                      setPersonForm({ ...personForm, name: e.target.value })
                    }
                    placeholder="مثلاً مریم رضایی"
                    className="mt-2 w-full rounded-xl border border-[#E6EDE8] bg-[#FBFDFC] px-4 py-3 text-sm outline-none focus:border-[#ff8a7a]"
                  />
                </label>

                <label className="block text-xs font-bold text-[#526D65]">
                  نسبت با شما <span className="text-rose-500">*</span>
                  <select
                    required
                    value={personForm.relation}
                    onChange={(e) =>
                      setPersonForm({
                        ...personForm,
                        relation: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-[#E6EDE8] bg-[#FBFDFC] px-4 py-3 text-sm outline-none focus:border-[#ff8a7a]"
                  >
                    {relations.map((relation) => (
                      <option key={relation}>{relation}</option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-bold text-[#526D65]">
                    سن <span className="text-rose-500">*</span>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      step="1"
                      required
                      value={personForm.age}
                      onChange={(e) =>
                        setPersonForm({
                          ...personForm,
                          age: e.target.value,
                        })
                      }
                      placeholder="مثلاً ۳۲"
                      className="mt-2 w-full rounded-xl border border-[#E6EDE8] bg-[#FBFDFC] px-4 py-3 text-sm outline-none focus:border-[#ff8a7a]"
                    />
                  </label>

                  <label className="block text-xs font-bold text-[#526D65]">
                    جنسیت <span className="text-rose-500">*</span>
                    <select
                      required
                      value={personForm.gender}
                      onChange={(e) =>
                        setPersonForm({
                          ...personForm,
                          gender: e.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-[#E6EDE8] bg-[#FBFDFC] px-4 py-3 text-sm outline-none focus:border-[#ff8a7a]"
                    >
                      <option value="">انتخاب جنسیت</option>
                      <option value="زن">زن</option>
                      <option value="مرد">مرد</option>
                    </select>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-[#526D65]">
                      علاقه‌مندی‌ها <span className="text-rose-500">*</span>
                    </p>
                    <p className="mt-1 text-[11px] font-normal text-[#91A49B]">
                      یک یا چند مورد را انتخاب کن تا پیشنهادهای هدیه دقیق‌تر شوند.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {interestOptions.map((interest) => {
                      const isSelected = personForm.interest.includes(interest);
                      const isUnknown = interest === "هنوز نمی‌دانم";

                      return (
                        <button
                          key={interest}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            setPersonForm((current) => {
                              if (isUnknown) {
                                return {
                                  ...current,
                                  interest: isSelected ? [] : ["هنوز نمی‌دانم"],
                                };
                              }

                              const withoutUnknown = current.interest.filter(
                                (item) => item !== "هنوز نمی‌دانم",
                              );

                              return {
                                ...current,
                                interest: withoutUnknown.includes(interest)
                                  ? withoutUnknown.filter((item) => item !== interest)
                                  : [...withoutUnknown, interest],
                              };
                            });
                          }}
                          className={`rounded-xl border px-3 py-2.5 text-right text-xs font-semibold transition ${
                            isSelected
                              ? "border-[#0D3B40] bg-[#EAF2F1] text-[#0D3B40]"
                              : "border-[#E6EDE8] bg-[#FBFDFC] text-[#526D65] hover:border-[#B8D2C8]"
                          }`}
                        >
                          <span className="ml-1 inline-block">
                            {isSelected ? "✓" : "＋"}
                          </span>
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                  {personForm.interest.length === 0 && (
                    <p className="text-[11px] text-[#D97777]">
                      انتخاب حداقل یک مورد الزامی است.
                    </p>
                  )}

                  <label className="block text-xs font-bold text-[#526D65]">
                    توضیحات بیشتر درباره علاقه‌مندی‌ها
                    <span className="mr-1 font-normal text-[#91A49B]">(اختیاری)</span>
                    <textarea
                      value={personForm.interestDescription}
                      onChange={(e) =>
                        setPersonForm({
                          ...personForm,
                          interestDescription: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="مثلاً به رمان‌های تاریخی علاقه دارد، طرفدار موسیقی سنتی است یا وسایل کاربردی مرتبط با سفر را دوست دارد..."
                      className="mt-2 w-full resize-y rounded-xl border border-[#E6EDE8] bg-[#FBFDFC] px-4 py-3 text-sm font-normal leading-7 text-[#344E47] outline-none placeholder:text-[#A5B4AC] focus:border-[#ff8a7a]"
                    />
                    <span className="mt-1 block text-[11px] font-normal text-[#91A49B]">
                      هر نکته‌ای که به شناخت بهتر سلیقه فرد و پیشنهاد هدیه مناسب‌تر کمک می‌کند، اینجا بنویس.
                    </span>
                  </label>
                </div>

                <label className="block text-xs font-bold text-[#526D65]">
                  آخرین هدیه‌ای که گرفته
                  <input
                    value={personForm.lastGift}
                    onChange={(e) =>
                      setPersonForm({
                        ...personForm,
                        lastGift: e.target.value,
                      })
                    }
                    placeholder="مثلاً عطر"
                    className="mt-2 w-full rounded-xl border border-[#E6EDE8] bg-[#FBFDFC] px-4 py-3 text-sm outline-none focus:border-[#ff8a7a]"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                {/* نام فرد به‌صورت خودکار از فرم قبلی */}
                <label className="block text-xs font-bold text-[#526D65]">
                  نام فرد
                  <input
                    value={occasionForm.person}
                    readOnly
                    className="mt-2 w-full cursor-not-allowed rounded-xl border border-[#E6EDE8] bg-[#F3F8F5] px-4 py-3 text-sm text-[#526D65] outline-none"
                  />
                </label>

                {/* نوع مناسبت */}
                <label className="block text-xs font-bold text-[#526D65]">
                  نوع مناسبت
                  <select
                    value={occasionForm.type}
                    onChange={(e) => {
                      const type = e.target.value;

                      setOccasionForm({
                        ...occasionForm,
                        title: type,
                        type,
                        recurring: isRecurringByDefault(type),
                      });
                    }}
                    className="mt-2 w-full rounded-xl border border-[#E6EDE8] bg-[#FBFDFC] px-4 py-3 text-sm outline-none focus:border-[#ff8a7a]"
                  >
                    {occasionTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                {/* تاریخ مناسبت */}
                <label className="block text-xs font-bold text-[#526D65]">
                  تاریخ مناسبت (شمسی)

                  <div className="mt-2">
                    <DatePicker
                      value={occasionForm.date || ""}
                      onChange={(date) => {
                        setOccasionForm({
                          ...occasionForm,
                          date: date ? date.format("YYYY/MM/DD") : "",
                        });
                      }}
                      calendar={persian}
                      locale={persian_fa}
                      calendarPosition="bottom-right"
                      format="YYYY/MM/DD"
                      placeholder="روز، ماه و سال را انتخاب کن"
                      inputClass="w-full rounded-xl border border-[#E6EDE8] bg-[#FBFDFC] px-4 py-3 text-sm outline-none focus:border-[#ff8a7a]"
                      containerClassName="w-full"
                      editable={false}
                      className="rmdp-kadobot"
                    />
                  </div>

                  <span className="mt-2 block text-[11px] font-normal text-[#91A49B]">
                    در تقویم شمسی، سال و ماه را انتخاب کن و سپس روی روز
                    موردنظر بزن.
                  </span>
                </label>

                {/* تکرار سالانه */}
                <div className="rounded-xl border border-[#E6EDE8] bg-[#F3F8F5] p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={occasionForm.recurring}
                      onChange={(e) =>
                        setOccasionForm({
                          ...occasionForm,
                          recurring: e.target.checked,
                        })
                      }
                      className="mt-0.5 h-4 w-4 accent-[#ff8a7a]"
                    />

                    <span>
                      <span className="block text-xs font-bold text-[#315F52]">
                        این مناسبت هر سال تکرار می‌شود
                      </span>

                      <span className="mt-1 block text-[11px] font-normal leading-6 text-[#779187]">
                        برای تولد و سالگردها فعالش کن. برای اتفاق‌هایی مثل
                        شروع شغل جدید یا فارغ‌التحصیلی، غیرفعال بگذار.
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="mt-7 flex gap-3">
              <button
                onClick={modalType === "person" ? savePerson : saveOccasion}
                className="flex-1 rounded-xl bg-[#173F40] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#245B58]"
              >
                {editingId ? "ذخیره تغییرات" : "ثبت اطلاعات"}
              </button>

              <button
                onClick={() => {
                  setEditingId(null);
                  setModalType(null);
                }}
                className="rounded-xl border border-[#E8EDEA] px-5 py-3.5 text-sm font-bold text-[#81918B] hover:bg-[#F8FAF8]"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* پنجره تأیید حذف */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#102D2D]/55 p-4 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-[26px] border border-white/70 bg-white p-6 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0F0] text-[#D65F68]">
              <Icon name="trash" size={24} />
            </div>

            <h3 className="mt-4 text-lg font-black text-[#173F40]">
              تأیید حذف
            </h3>

            <p className="mt-2 text-sm leading-7 text-[#82958D]">
              {deleteTarget.type === "person"
                ? `آیا مطمئنی می‌خواهی «${deleteTarget.item.name}» را از فهرست افراد حذف کنی؟`
                : `آیا مطمئنی می‌خواهی مناسبت «${deleteTarget.item.title}» را حذف کنی؟`}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-[#E6ECE8] px-4 py-3 text-sm font-bold text-[#71877D] transition hover:bg-[#F7FAF8]"
              >
                انصراف
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-[#D95F68] px-4 py-3 text-sm font-black text-white transition hover:bg-[#BD4854]"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نوار بالای صفحه */}
      <header className="fixed inset-x-0 top-3 z-50 px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/80 bg-white/65 px-5 py-3 shadow-[0_8px_35px_rgba(65,49,45,0.10)] backdrop-blur-2xl">
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF9A85] to-[#F36F78] text-white shadow-md shadow-rose-200">
              <Icon name="gift" size={24} />
            </div>

            <div>
              <div className="text-xl font-black tracking-tight text-[#173F40]">
                کادوبات
              </div>
              <div className="text-[10px] text-[#8C9F99]">
                مناسبت به یاد، هدیه به‌جا
              </div>
            </div>
          </a>

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 rounded-xl border border-[#F0E8E4] bg-white/80 px-3 py-2 transition hover:border-[#FFB3A5] hover:shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D8C7FF] to-[#A995EE] text-sm font-black text-[#59458C]">
                  ع
                </div>

                <div className="hidden text-right sm:block">
                  <div className="text-xs font-extrabold text-[#173F40]">
                    {userName || userEmail || "کاربر کادوبات"}
                  </div>
                </div>

                <span className="text-[#8A9B97]">
                  <Icon name="chevron" size={16} />
                </span>
              </button>

              {profileOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 rounded-2xl border border-[#F0E8E4] bg-white p-2 shadow-xl">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      window.location.href = "/settings";
                    }}
                    className="w-full rounded-xl bg-[#FFF6F1] px-3 py-3 text-right text-xs font-bold text-[#173F40] transition hover:bg-[#FFECE5]"
                  >
                    تنظیمات حساب
                  </button>

                  <button
                    onClick={handleLogout}
                    className="mt-1 w-full rounded-xl px-3 py-3 text-right text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                  >
                    خروج از حساب
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/signup"
              className="flex items-center gap-2 rounded-xl bg-[#173F40] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#245B58]"
            >
              <Icon name="login" size={16} />
              ورود / ثبت‌نام
            </a>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6">
        {/* بنر اصلی */}
        <section className="relative mb-8 overflow-hidden rounded-[32px] bg-[#142F43] shadow-[0_22px_65px_rgba(30,42,77,0.22)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#173E50] via-[#263B59] to-[#43345E]" />
          <div className="absolute -right-28 -top-32 h-96 w-96 rounded-full bg-[#F47783]/25 blur-[85px]" />
          <div className="absolute -bottom-40 left-[25%] h-96 w-96 rounded-full bg-[#8272E8]/30 blur-[90px]" />

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.10]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative grid min-h-[390px] grid-cols-1 items-center gap-2 px-6 py-9 sm:px-10 sm:py-10 lg:grid-cols-2 lg:px-14">
            <div className="relative z-20 max-w-xl text-right">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-[#FFE0C7] shadow-sm backdrop-blur-md">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF9A85] text-white">
                  <Icon name="sparkles" size={12} />
                </span>
                دستیار هوشمند انتخاب هدیه
              </div>

              {userFirstName && (
                <p className="mb-3 text-lg font-bold text-white/90">
                  سلام {userFirstName} عزیز
                </p>
              )}

              <h1 className="text-[32px] font-black leading-[1.65] tracking-tight text-white sm:text-[42px] lg:text-[48px]">
                بعضی لبخندها
                <br />
                <span className="relative inline-block text-[#FFB29E]">
                  ارزش به یاد ماندن
                  <span className="absolute -bottom-1 right-0 h-[5px] w-full rounded-full bg-gradient-to-l from-[#FFD58C] to-[#FF8F91]" />
                </span>
                <br />
                دارند!
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-8 text-[#D4DCE8] sm:text-base">
                کادوبات مناسبت‌های مهم رو به یادت می‌سپاره و کمک می‌کنه برای
                آدم‌های خاص زندگی‌ات، هدیه‌ای پیدا کنی که از ته دل خوشحالشون
                کنه.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      window.location.href = "/signup";
                      return;
                    }

                    openPersonModal();
                  }}
                  className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#FF987F] to-[#F16E83] px-6 py-4 text-sm font-black text-white"
                >
                  شروع تجربه کادوبات
                  <Icon name="arrow" size={17} />
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-5 text-[11px] font-medium text-[#C2D0DC]">
                <span>● یادآوری مناسبت‌ها</span>
                <span>● پیشنهاد هوشمند هدیه</span>
                <span>● متناسب با بودجه تو</span>
              </div>
            </div>

            <div className="relative z-10 -my-2 lg:my-0">
              <GiftIllustration />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-l from-[#FFB28F] via-[#F17C91] to-[#A18AF0]" />
        </section>

        {/* جستجو */}
        <div className="group mb-7 flex items-center gap-3 rounded-2xl border border-[#F0E6E1] bg-white px-4 py-3 shadow-[0_4px_18px_rgba(65,49,45,0.04)] transition-all duration-200 hover:border-[#F4B6A9] focus-within:border-[#F28A7B] focus-within:shadow-[0_0_0_4px_rgba(242,138,123,0.14)]">
          <span className="text-[#E58B7D]">
            <Icon name="search" size={19} />
          </span>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو بین افراد و مناسبت‌ها..."
            className="w-full bg-transparent text-sm text-[#173F40] outline-none placeholder:text-[#B4A6A0]"
          />
        </div>

        {/* داشبورد */}
        <div className="flex flex-col items-stretch gap-6 lg:grid-cols-2">
          {/* مناسبت‌ها */}
          <section
            id="occasions"
            style={{ order: showPeopleFirst ? 2 : 1 }}
            className="flex h-full min-h-[500px] flex-col rounded-[26px] border border-[#D9ECE5] bg-gradient-to-br from-[#E8F7F0] to-[#F5FBF6] p-5 shadow-[0_8px_25px_rgba(48,123,98,0.06)] sm:p-6"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#159B83] shadow-sm">
                  <Icon name="calendar" size={21} />
                </div>

                <div>
                  <h2 className="font-black text-[#174C46]">
                    مناسبت‌های پیش‌رو
                  </h2>
                  <p className="mt-1 text-xs text-[#7D9D92]">
                    اتفاق‌های قشنگ نزدیک‌اند
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#159B83] shadow-sm">
                  {persianNumber(filteredOccasions.length)} مناسبت
                </span>

                {filteredOccasions.length > 0 && (
                  <button
                    onClick={() => openOccasionModal()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#159B83] px-3 py-2 text-xs font-black text-white transition hover:bg-[#117E6C]"
                  >
                    <Icon name="plus" size={15} />
                    افزودن
                  </button>
                )}
              </div>
            </div>

            {filteredOccasions.length > 0 ? (
              <div
                dir="ltr"
                className="kado-modern-scroll flex h-[380px] min-h-[380px] flex-col gap-3 overflow-y-auto overflow-x-hidden overscroll-y-contain pl-2 pb-3"
              >
                {filteredOccasions.map((occasion, index) => (
                  <div
                    key={occasion.id}
                    dir="rtl"
                    className="group relative flex min-h-[88px] w-full shrink-0 snap-start items-center justify-between gap-3 rounded-2xl border border-white/90 bg-white/95 p-3 shadow-[0_3px_12px_rgba(36,77,73,0.045)] transition duration-200 hover:-translate-y-0.5 hover:border-[#BFE5D7] hover:shadow-[0_8px_20px_rgba(36,77,73,0.09)] max-sm:flex-col max-sm:items-stretch sm:gap-4 sm:px-4 sm:py-3.5"
                  >
                    {/* اطلاعات فرد و مناسبت */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          index === 0
                            ? "bg-[#FFE7E0] text-[#ED7868]"
                            : index === 1
                              ? "bg-[#E8E1FF] text-[#8569D5]"
                              : "bg-[#FFF0CE] text-[#D99B36]"
                        }`}
                      >
                        <Icon name="gift" size={22} />
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* خط اول: نام فرد و بج نسبت */}
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h3 className="truncate whitespace-nowrap text-sm font-extrabold text-[#244D49]">
                            {occasion.person}
                          </h3>

                          {occasion.relation && (
                            <RelationBadge relation={occasion.relation} />
                          )}
                        </div>

                        {/* خط دوم: نوع مناسبت */}
                        <p className="mt-1 text-[11px] font-bold text-[#159B83]">
                          {occasion.type}
                        </p>
                      </div>
                    </div>

                    {/* تاریخ، روزهای باقی‌مانده و بج تکرار سالانه */}
<div className="flex shrink-0 items-center justify-start gap-2 max-sm:w-full max-sm:flex-wrap sm:gap-2">
  {/* تاریخ مناسبت */}
  <div className="flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#F4F8F5] px-2.5 py-2 text-xs text-[#66847A]">
    <Icon name="calendar" size={14} />
    <span>{formatJalaliDate(occasion.date)}</span>
  </div>

  {/* روزهای باقی‌مانده */}
  <div className="flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#EAF7F1] px-2.5 py-2 text-xs font-extrabold text-[#12836F]">
    <Icon name="gift" size={14} />
    <span>{daysLabel(occasion)}</span>
  </div>

  {/* بج تکرار سالانه؛ فقط برای مناسبت‌های تکرارشونده */}
  {occasion.recurring && (
    <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-lg border border-[#D8EDE2] bg-[#F0F8F3] px-2.5 py-2 text-[10px] font-bold text-[#39866C]">
      تکرار سالانه
    </span>
  )}
</div>

                    {/* دکمه‌های ویرایش و حذف */}
                    <div className="flex shrink-0 items-center justify-center gap-1 pr-0 max-sm:w-full max-sm:justify-end sm:pr-3">
                      <button
                        onClick={() => openOccasionModal(occasion)}
                        title="ویرایش مناسبت"
                        aria-label="ویرایش مناسبت"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#72968A] transition hover:bg-[#E8F7F0] hover:text-[#159B83]"
                      >
                        <Icon name="edit" size={16} />
                      </button>

                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: "occasion",
                            item: occasion,
                          })
                        }
                        title="حذف مناسبت"
                        aria-label="حذف مناسبت"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#C58C8D] transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[#B9D9CD] bg-white/75 px-5 py-10 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDF4E9] text-[#159B83]">
                  <Icon name="calendar" size={25} />
                </div>

                <h3 className="font-bold text-[#174C46]">
                  {search ? "مناسبتی پیدا نشد" : "هنوز مناسبتی ثبت نکردی"}
                </h3>

                <p className="mx-auto mt-2 max-w-xs text-xs leading-6 text-[#829C91]">
                  تولدها و سالگردهای مهم رو ثبت کن تا هیچ مناسبت قشنگی رو
                  فراموش نکنی.
                </p>

                {!search && (
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        window.location.href = "/signup";
                        return;
                      }

                      openOccasionModal();
                    }}
                    className="mt-5 rounded-xl bg-[#159B83] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#117E6C]"
                  >
                    اولین مناسبتت رو ثبت کن
                  </button>
                )}
              </div>
            )}
          </section>

          {/* افراد */}
          <section
            id="people"
            style={{ order: showPeopleFirst ? 1 : 2 }}
            className="flex h-full min-h-[500px] flex-col rounded-[26px] border border-[#F4DFE7] bg-gradient-to-br from-[#FFF0F4] to-[#FFF9F3] p-5 shadow-[0_8px_25px_rgba(207,111,142,0.06)] sm:p-6"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#DE7195] shadow-sm">
                  <Icon name="users" size={21} />
                </div>

                <div>
                  <h2 className="font-black text-[#6D3F53]">
                    آدم‌های خاص زندگی من
                  </h2>
                  <p className="mt-1 text-xs text-[#B38B9A]">
                    کسانی که دوستشون داری
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#D66F91] shadow-sm">
                  {persianNumber(filteredPeople.length)} نفر
                </span>

                {filteredPeople.length > 0 && (
                  <button
                    onClick={() => openPersonModal()}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#D66F91] px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#BD5578]"
                  >
                    <Icon name="plus" size={15} />
                    افزودن
                  </button>
                )}
              </div>
            </div>

            {filteredPeople.length > 0 ? (
              <div
                dir="ltr"
                className="kado-modern-scroll flex h-[380px] min-h-[380px] flex-col gap-3 overflow-y-auto overflow-x-hidden overscroll-y-contain pl-2 pb-3"
              >
                {filteredPeople.map((person) => (
                  <div
                    key={person.id}
                    dir="rtl"
                    className="group flex min-h-[150px] w-full shrink-0 snap-start flex-row items-start justify-between gap-3 rounded-2xl border border-white bg-white/95 p-3 shadow-[0_3px_12px_rgba(109,63,83,0.045)] transition duration-200 hover:-translate-y-0.5 hover:border-[#F2C8D7] hover:shadow-[0_8px_20px_rgba(109,63,83,0.09)] max-sm:flex-col max-sm:items-stretch sm:gap-4 sm:px-4 sm:py-3.5"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${person.color}`}
                        >
                          {person.initial}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-extrabold text-[#553D49]">
                              {person.name}
                            </h3>
                            <RelationBadge relation={person.relation} />
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {person.age !== null && (
                              <span className="rounded-full bg-[#FFF7F9] px-2 py-1 text-[10px] font-medium text-[#80616F]">
                                {persianNumber(person.age)} سال
                              </span>
                            )}
                            {person.gender && (
                              <span className="rounded-full bg-[#FFF7F9] px-2 py-1 text-[10px] font-medium text-[#80616F]">
                                {person.gender}
                              </span>
                            )}
                            {person.city && (
                              <span className="rounded-full bg-[#FFF7F9] px-2 py-1 text-[10px] font-medium text-[#80616F]">
                                {person.city}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0 space-y-2 sm:mr-[60px]">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="shrink-0 text-[10px] text-[#B58D9D]">علاقه‌مندی‌ها:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {person.interest
                              ? person.interest.split(/[,،]/).map((item) => item.trim()).filter(Boolean).map((interest) => (
                                  <span key={interest} className="rounded-full bg-[#FFF0F4] px-2.5 py-1 text-[10px] font-semibold text-[#986276]">
                                    {interest}
                                  </span>
                                ))
                              : <span className="text-xs text-[#80616F]">ثبت نشده</span>}
                          </div>
                        </div>

                        {person.interestDescription?.trim() && (
<div className="flex min-w-0 items-start gap-2 rounded-lg bg-[#FFFAFC] pl-3 py-2">                            <p className="shrink-0 text-[10px] leading-5 text-[#B58D9D]">درباره سلیقه‌اش:</p>
<p className="min-w-0 flex-1 text-xs leading-5 text-[#80616F] break-words" title={person.interestDescription}>                              {person.interestDescription}
                            </p>
                          </div>
                        )}

                        {person.lastGift && (
                          <p className="text-[10px] text-[#9A7B88]">
                            آخرین هدیه: <span className="font-semibold text-[#80616F]">{person.lastGift}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 pr-2 sm:pr-3">
                      <button
                        onClick={() => handleGiftRecommendation(person)}
                        title="پیشنهاد هدیه برای این فرد"
                        aria-label={`پیشنهاد هدیه برای ${person.name}`}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-[#173F40] px-2.5 text-[10px] font-bold text-white transition hover:bg-[#245B59]"
                      >
                        <Icon name="sparkles" size={13} />
                        پیشنهاد هدیه
                      </button>
                      <button
                        onClick={() => openPersonModal(person)}
                        title="ویرایش فرد"
                        aria-label="ویرایش فرد"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#B66D8A] transition hover:bg-[#FFF0F4] hover:text-[#A94F70]"
                      >
                        <Icon name="edit" size={16} />
                      </button>

                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: "person",
                            item: person,
                          })
                        }
                        title="حذف فرد"
                        aria-label="حذف فرد"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#C58C8D] transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[#E8CBD6] bg-white/75 px-5 py-8 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFE3EC] text-[#D66F91]">
                  <Icon name="users" size={25} />
                </div>

                <h3 className="font-bold text-[#6D3F53]">
                  {search ? "فردی پیدا نشد" : "هنوز کسی رو اضافه نکردی"}
                </h3>

                <p className="mt-2 text-xs leading-6 text-[#A58E98]">
                  آدم‌های مهم زندگی‌ات رو به کادوبات معرفی کن.
                </p>

                {!search && (
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        window.location.href = "/signup";
                        return;
                      }

                      openPersonModal();
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#D66F91] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#BD5578]"
                  >
                    <Icon name="plus" size={16} />
                    افزودن اولین فرد
                  </button>
                )}
              </div>
            )}
          </section>
        </div>

        {/* بنر دستیار هوشمند */}
        <section className="group relative mt-7 overflow-hidden rounded-[28px] border border-[#E5E9D8] bg-[#F1F0E5] shadow-[0_12px_35px_rgba(36,67,57,0.09)] transition duration-300 hover:shadow-[0_18px_42px_rgba(36,67,57,0.14)]">
          <div className="absolute inset-0 bg-gradient-to-l from-[#E5EBD9] via-[#F3F0E2] to-[#F8E6D9]" />
          <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-[#F28B78]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-[30%] h-64 w-64 rounded-full bg-[#A9C9B4]/40 blur-3xl" />

          <div className="relative grid min-h-[190px] grid-cols-1 items-center gap-4 px-6 py-6 sm:px-9 sm:py-7 lg:grid-cols-[1fr_210px] lg:gap-8 lg:px-11">
            <div className="relative z-10 text-right">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D6E1D3] bg-white/70 px-3 py-1.5 text-[11px] font-extrabold text-[#54776B] shadow-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E87872] text-white">
                  <Icon name="sparkles" size={12} />
                </span>
                دستیار هوشمند کادوبات
              </div>

              <h2 className="text-2xl font-black leading-relaxed text-[#173F40] sm:text-[32px]">
                برای هر آدم خاص،{" "}
                <span className="mr-2 inline-block text-[#E87872]">
                  یک هدیه خاص
                </span>
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#62766C]">
                علایق، علاقه‌مندی و بودجه‌ات را به کادوبات بسپار تا هدیه‌ای
                پیدا کنیم که واقعاً خوشحالش کند.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold text-[#54776B] shadow-sm">
                  ✨ پیشنهاد هوشمند
                </span>

                <span className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold text-[#54776B] shadow-sm">
                  🎁 متناسب با علایق
                </span>

                <span className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold text-[#54776B] shadow-sm">
                  💝 متناسب با بودجه
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={openGiftPersonPicker}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#173F40] px-6 py-3 text-xs font-black text-white transition hover:bg-[#245B59]"
                >
                  پیشنهاد هدیه من
                  <Icon name="sparkles" size={16} />
                </button>

                <span className="text-[10px] font-medium text-[#819087]">
                  انتخاب از بین افراد ثبت‌شده و جست‌وجوی محصولات
                </span>
              </div>
            </div>

            <div className="relative mx-auto hidden h-[170px] w-[190px] items-center justify-center lg:flex">
              <div className="absolute h-40 w-40 rounded-full border border-[#B6CBB9] opacity-70" />
              <div className="absolute h-32 w-32 rounded-full bg-[#D5E3D1]/70" />

              <div className="absolute left-5 top-4 text-2xl text-[#E87872]">
                ✦
              </div>

              <div className="absolute right-5 top-7 text-xl text-[#C49A56]">
                ✧
              </div>

              <div className="relative z-10 h-[105px] w-[112px] -rotate-6 rounded-[20px] bg-gradient-to-br from-[#F18D7D] to-[#DB6674] shadow-[0_18px_30px_rgba(92,83,66,0.2)] transition duration-500 group-hover:-rotate-3 group-hover:scale-105">
                <div className="absolute left-1/2 top-0 h-full w-5 -translate-x-1/2 bg-[#F9D99B]" />
                <div className="absolute left-0 top-[38%] h-5 w-full bg-[#F9D99B]" />

                <div className="absolute -top-7 left-1/2 flex -translate-x-1/2">
                  <div className="h-8 w-10 -rotate-12 rounded-tl-full rounded-br-full border-[5px] border-[#E9BD78] bg-[#F7D99E]" />
                  <div className="-ml-2 h-8 w-10 rotate-12 rounded-tr-full rounded-bl-full border-[5px] border-[#E9BD78] bg-[#F7D99E]" />
                </div>

                <div className="absolute bottom-2 right-3 text-lg text-white">
                  ♥
                </div>
              </div>

              <div className="absolute bottom-4 right-0 flex h-11 w-11 items-center justify-center rounded-2xl border border-white bg-white text-[#E87872] shadow-lg">
                <Icon name="heart" size={21} />
              </div>

              <div className="absolute left-0 top-14 flex h-10 w-10 items-center justify-center rounded-xl border border-white bg-white text-[#719B84] shadow-lg">
                <Icon name="sparkles" size={19} />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-l from-[#E87872] via-[#E9B979] to-[#8BAE9B]" />
        </section>

        {/* تست اتصال Supabase */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
          <SupabaseTest />
        </div>

        {/* فوتر */}
        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#F0E2DC] pt-6 text-xs text-[#AA9992] sm:flex-row">
          <p>کادوبات؛ مناسبت به یاد، هدیه به‌جا.</p>
          <p>ساخته‌شده برای خوشحال کردن آدم‌های مهم زندگی</p>
        </footer>
      </div>
    </main>
    </>
  );
}
