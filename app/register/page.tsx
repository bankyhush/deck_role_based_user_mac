"use client";

import { useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const registerMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
    }) => {
      const res = await axios.post("/api/auth/register", data);
      return res.data;
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Account created! Please check your email to verify.");
      router.push("/verify-email-notice");
    },
    onError: (error: any) => {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) {
      toast.dismiss();
      return toast.error("Please fill all fields");
    }
    if (password !== confirm) return toast.error("Passwords do not match");
    if (password.length < 8) {
      toast.dismiss();
      return toast.error("Password must be at least 8 characters");
    }

    registerMutation.mutate({ name, email, password });
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
          Create an account
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          Get started — it only takes a minute
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Full name
            </label>
            <input
              type="text"
              placeholder="Ada Okafor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                placeholder="Min. 8 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Confirm
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {confirm && (
            <p
              className={`text-xs ${password === confirm ? "text-green-500" : "text-red-500"}`}
            >
              {password === confirm
                ? "Passwords match"
                : "Passwords do not match"}
            </p>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className={`w-full py-2.5 rounded-lg text-sm font-medium text-white transition ${
              registerMutation.isPending
                ? "bg-zinc-400 cursor-not-allowed"
                : "bg-zinc-900 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            }`}
          >
            {registerMutation.isPending
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-zinc-900 dark:text-white font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
