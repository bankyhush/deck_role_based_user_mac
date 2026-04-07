// app/page.tsx
"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-zinc-900 dark:to-zinc-950 p-6 text-center">
      {/* Logo / Hero */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-4">
          Welcome to <span className="text-blue-600">AuthStack API</span>
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Simplifying authentication and authorization for your applications.
          Our future API platform will let you manage users, roles, and
          permissions seamlessly.
        </p>
      </div>

      {/* Call-to-action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link href="/login">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Login
          </button>
        </Link>
        <Link href="/register">
          <button className="px-6 py-3 bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-zinc-700 transition">
            Sign Up
          </button>
        </Link>
      </div>

      {/* Footer / Future API note */}
      <div className="mt-12 text-zinc-500 dark:text-zinc-400 text-sm max-w-md">
        <p>
          AuthStack API is in development. Soon, you'll be able to integrate
          powerful user authentication and role-based access into your apps
          effortlessly.
        </p>
      </div>
    </div>
  );
}
