"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
 const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
const [showMessage, setShowMessage] = useState(false);
useEffect(() => {
  if (!message) return;

  setShowMessage(true);

  const hideTimer = window.setTimeout(() => {
    setShowMessage(false);
  }, 2000);

  const clearTimer = window.setTimeout(() => {
    setMessage("");
  }, 2350);

  return () => {
    window.clearTimeout(hideTimer);
    window.clearTimeout(clearTimer);
  };
}, [message]);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");
      setFirstName(user.user_metadata?.first_name ?? "");
      setLastName(user.user_metadata?.last_name ?? "");
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function saveName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      },
    });

    setSaving(false);

    if (error) {
      setMessageType("error");
      setMessage("ذخیره اطلاعات حساب انجام نشد. لطفاً دوباره تلاش کن.");
      return;
    }

    setMessageType("success");
    setMessage("نام و نام خانوادگی با موفقیت ذخیره شد.");
  }
  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (newPassword.length < 8) {
      setMessageType("error");
      setMessage("رمز عبور جدید باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessageType("error");
      setMessage("تکرار رمز عبور جدید با رمز عبور جدید مطابقت ندارد.");
      return;
    }

    setSaving(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (loginError) {
      setMessageType("error");
      setMessage("رمز عبور فعلی اشتباه است. لطفاً دوباره بررسی کن.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setSaving(false);

    if (updateError) {
      setMessageType("error");
      setMessage("متأسفانه تغییر رمز عبور انجام نشد. لطفاً دوباره تلاش کن.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessageType("success");
    setMessage("رمز عبور با موفقیت تغییر کرد.");
  }
  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#FBFBFB] text-sm text-[#0D3B40]"
      >
        در حال دریافت اطلاعات حساب...
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#FBFBFB] px-5 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-2xl flex-col justify-center">
        <button
          onClick={() => router.push("/")}
          className="mb-8 text-sm font-bold text-[#0D3B40] hover:text-[#FF8A7A]"
        >
          → بازگشت به داشبورد
        </button>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
         {message && (
  <div
    role="alert"
  className={`fixed right-5 top-5 z-50 w-[calc(100%-2.5rem)] max-w-md flex items-start gap-3 rounded-2xl border p-4 text-right shadow-lg animate-in slide-in-from-top-4 fade-in duration-300 ${
      messageType === "success"
        ? "border-[#BFE5CC] bg-[#EFF9F2] text-[#216C3C]"
        : messageType === "error"
        ? "border-[#F3C5C2] bg-[#FFF1F0] text-[#A52E29]"
        : "border-[#F3DFB8] bg-[#FFF8EB] text-[#8B601A]"
    }`}
  >
    <span className="mt-0.5 text-xl">
      {messageType === "success"
        ? "✓"
        : messageType === "error"
        ? "!"
        : "i"}
    </span>

    <div className="flex-1">
      <p className="text-sm font-extrabold">
        {messageType === "success"
          ? "عملیات موفق"
          : messageType === "error"
          ? "خطا در عملیات"
          : "اطلاع‌رسانی"}
      </p>

      <p className="mt-1 text-sm leading-6">
        {message}
      </p>
    </div>
  </div>
)}
          <h1 className="text-2xl font-black text-[#0D3B40]">تنظیمات حساب</h1>
          <p className="mt-2 text-sm text-gray-500">
            اطلاعات حساب کاربری خود را مدیریت کن.
          </p>

          <form onSubmit={saveName} className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#0D3B40]">
                ایمیل حساب
              </label>
              <input
                type="email"
                value={email}
                readOnly
                dir="ltr"
                autoComplete="off"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-500"
              />
              <p className="mt-2 text-xs text-gray-400">
                ایمیل حساب فعلاً قابل تغییر نیست.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#0D3B40]">
                نام
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="نام خود را وارد کن"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF8A7A]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#0D3B40]">
                نام خانوادگی
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="نام خانوادگی خود را وارد کن"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF8A7A]"
              />
            </div>

            <button
              type="submit"
              disabled={saving || (!firstName.trim() && !lastName.trim())}
              className="w-full rounded-xl bg-[#FF8A7A] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </form>
          <div className="mt-10 border-t border-gray-100 pt-8">
            <h2 className="text-lg font-black text-[#0D3B40]">
              تغییر رمز عبور
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              برای امنیت حساب خود، رمز عبور جدیدی انتخاب کن.
            </p>

            <form onSubmit={changePassword} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#0D3B40]">
                  رمز عبور فعلی
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 pl-12 text-sm outline-none transition focus:border-[#FF8A7A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                  >
                    {showCurrentPassword ? "مخفی کردن" : "نمایش"}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#0D3B40]">
                  رمز عبور جدید
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 pl-12 text-sm outline-none transition focus:border-[#FF8A7A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                  >
                    {showNewPassword ? "مخفی کردن" : "نمایش"}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#0D3B40]">
                  تکرار رمز عبور جدید
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 pl-12 text-sm outline-none transition focus:border-[#FF8A7A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                  >
                    {showConfirmPassword ? "مخفی کردن" : "نمایش"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  saving ||
                  !currentPassword ||
                  newPassword.length < 8 ||
                  !confirmPassword
                }
                className="w-full rounded-xl bg-[#0D3B40] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
              >
                {saving ? "در حال انجام..." : "تغییر رمز عبور"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
