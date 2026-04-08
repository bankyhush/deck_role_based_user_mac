"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import api from "@/lib/axiosInstance";

export default function VerifyEmailNoticePage() {
  const [resending, setResending] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const handleResend = async () => {
    if (!email) return toast.error("Email not found");
    setResending(true);
    try {
      await api.post("/api/auth/resend-verification", { email });
      toast.success("Verification email resent!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">
          Check your email
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed mb-2">
          We sent a verification link to
        </p>
        {email && (
          <p className="text-sm font-medium text-zinc-900 dark:text-white mb-6">
            {email}
          </p>
        )}
        <p className="text-xs text-zinc-400 mb-8">
          Click the link in the email to verify your account. The link expires
          in 24 hours.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full py-2.5 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend verification email"}
          </button>

          <Link href="/login">
            <button className="w-full py-2.5 rounded-lg text-sm font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-80 transition">
              Back to login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
