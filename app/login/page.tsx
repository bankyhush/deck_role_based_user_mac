"use client";

import { useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (creds: { email: string; password: string }) => {
      const res = await axios.post("/api/auth/login", creds);
      return res.data;
    },
    onSuccess: () => {
      queryClient.clear(); // ✅ clear previous user cache
      toast.success("Welcome back!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Login failed";

      // ✅ show resend option if email not verified
      if (error.response?.status === 403) {
        toast.error(message, { duration: 6000 });
      } else {
        toast.error(message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill all fields");
    loginMutation.mutate({ email, password });
  };

  const inputClass =
    "px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white w-full";

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center mb-6">
          <svg
            className="w-5 h-5 stroke-white dark:stroke-zinc-900 fill-none stroke-2"
            viewBox="0 0 18 18"
          >
            <path
              d="M9 2L2 7v9h5v-5h4v5h5V7z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          Sign in to your account to continue
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Password
              </label>
              <span className="text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer">
                Forgot password?
              </span>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* ✅ resend verification link if 403 */}
          {loginMutation.isError &&
            loginMutation.error?.response?.status === 403 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                  Your email is not verified yet.
                </p>
                <button
                  type="button"
                  onClick={() => resendVerification(email)}
                  className="text-xs text-amber-700 dark:text-amber-400 underline hover:no-underline"
                >
                  Resend verification email
                </button>
              </div>
            )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className={`w-full py-2.5 rounded-lg text-sm font-medium text-white transition ${
              loginMutation.isPending
                ? "bg-zinc-400 cursor-not-allowed"
                : "bg-zinc-900 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            }`}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-zinc-900 dark:text-white font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

// ✅ resend verification helper
async function resendVerification(email: string) {
  try {
    await axios.post("/api/auth/resend-verification", { email });
    toast.success("Verification email sent!");
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to resend email");
  }
}
