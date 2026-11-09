
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

  useEffect(() => {
    if (!message) return;

    const hideTimer = window.setTimeout(() => {
      setMessage("");
    }, 2350);

    return () => window.clearTimeout(hideTimer);
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
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setMessageType("success");
    setMessage("رمز عبور با موفقیت تغییر کرد.");
  }

  function PasswordEyeButton({
    visible,
    onClick,
  }: {
    visible: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={visible ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
        title={visible ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:text-[#0D3B40]"
      >
        {visible ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.3 4.5 9 7-.3 1.1-1 2.3-2 3.3" />
            <path d="M6.2 6.2C3.8 7.7 2.3 10 2 12c.7 2.5 4 7 10 7 1.2 0 2.3-.2 3.3-.6" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    );
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
              className={`fixed right-5 top-5 z-50 flex w-[calc(100%-2.5rem)] max-w-md items-start gap-3 rounded-2xl border p-4 text-right shadow-lg animate-in slide-in-from-top-4 fade-in duration-300 ${
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

                <p className="mt-1 text-sm leading-6">{message}</p>
              </div>
            </div>
          )}

          <h1 className="text-2xl font-black text-[#0D3B40]">
            تنظیمات حساب
          </h1>

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

                  <PasswordEyeButton
                    visible={showCurrentPassword}
                    onClick={() =>
                      setShowCurrentPassword(!showCurrentPassword)
                    }
                  />
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

                  <PasswordEyeButton
                    visible={showNewPassword}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  />
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

                  <PasswordEyeButton
                    visible={showConfirmPassword}
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  />
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
