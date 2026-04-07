"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    axios
      .get(`/api/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus("success");
        toast.success("Email verified! You can now log in.");
        setTimeout(() => router.push("/login"), 2000);
      })
      .catch((error) => {
        setStatus("error");
        toast.error(error.response?.data?.message || "Verification failed");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin mx-auto mb-4" />
            <p className="text-sm text-zinc-500">Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">
              Email verified!
            </h1>
            <p className="text-sm text-zinc-500 mb-6">
              Redirecting you to login...
            </p>
            <Link href="/login">
              <button className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-80 transition">
                Go to login
              </button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">
              Verification failed
            </h1>
            <p className="text-sm text-zinc-500 mb-6">
              The link is invalid or has expired.
            </p>
            <Link href="/verify-email-notice">
              <button className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-80 transition">
                Resend verification email
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
