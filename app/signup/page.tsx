
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
  email: email.trim(),
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/login`,
    data: {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    },
  },
});

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "ثبت‌نام انجام شد. لطفاً ایمیل خود را باز کنید و لینک تأیید را بزنید."
      );
      setPassword("");
    }

    setLoading(false);
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-5"
    >
      
<div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
  <a
    href="/"
    aria-label="بازگشت به داشبورد"
    title="بازگشت به داشبورد"
    className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-[#0D3B40]"
  >
    <span className="text-2xl leading-none">×</span>
  </a>

        <h1 className="text-2xl font-bold text-[#0D3B40] mb-2">
          ساخت حساب کادوبات
        </h1>

        <p className="text-gray-500 mb-8">
          برای شروع، حساب کاربری خود را بسازید.
        </p>

        <form onSubmit={handleSignup} className="space-y-5"
        autoComplete="off">
          <div>
            <div>
  <label className="mb-2 block text-sm font-bold text-[#0D3B40]">
    نام
  </label>
  <input
    type="text"
    required
    value={firstName}
    onChange={(e) => setFirstName(e.target.value)}
    placeholder="مثلاً علیرضا"
    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF8A7A]"
  />
</div>

<div>
  <label className="mb-2 block text-sm font-bold text-[#0D3B40]">
    نام خانوادگی
  </label>
  <input
    type="text"
    required
    value={lastName}
    onChange={(e) => setLastName(e.target.value)}
    placeholder="مثلاً امیری"
    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF8A7A]"
  />
</div>
            <label className="block text-sm mb-2">ایمیل</label>
            <input
              type="email"
              name="signup_email"
id="signup_email"
              dir="ltr"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#0D3B40]"
            />
          </div>

          
<div>
  <label className="block text-sm mb-2">رمز عبور</label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      dir="ltr"
      required
      minLength={8}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="حداقل ۸ کاراکتر"
      className="w-full rounded-xl border border-gray-200 p-3 pl-12 outline-none focus:border-[#0D3B40]"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0D3B40]"
    >
      {showPassword ? (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A11 11 0 0121 12a11.5 11.5 0 01-3.2 4.2M6.2 6.2A11.5 11.5 0 003 12a11.5 11.5 0 009 7 10.8 10.8 0 004-.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  </div>
</div>


          
<button
  type="submit"
disabled={
  loading ||
  !firstName.trim() ||
  !lastName.trim() ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
  password.length < 8
}
  className="w-full rounded-xl bg-[#FF8A7A] p-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
>
  {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
</button>

        </form>

        {message && (
          <p className="mt-5 rounded-xl bg-gray-50 p-3 text-sm text-[#0D3B40]">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          قبلاً حساب ساخته‌اید؟{" "}
          <a href="/login" className="font-semibold text-[#0D3B40]">
            ورود به حساب
          </a>
        </p>
      </div>
    </main>
  );
}
