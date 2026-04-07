"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  emailVerified: boolean;
  createdAt: string;
}

interface Props {
  user: { id: string; email: string; role: "USER" | "MODERATOR" | "ADMIN" };
}

export default function ModeratorLogic({ user: serverUser }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: users, isPending } = useQuery<User[]>({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await axios.get("/api/moderator/users");
      return res.data.data;
    },
  });

  const handleLogout = async () => {
    await axios.post("/api/auth/logout");
    queryClient.clear();
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                MODERATOR
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Moderator Panel
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Manage and monitor users
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                Dashboard
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total users", value: users?.length ?? 0 },
            {
              label: "Verified",
              value: users?.filter((u) => u.emailVerified).length ?? 0,
            },
            {
              label: "Unverified",
              value: users?.filter((u) => !u.emailVerified).length ?? 0,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4"
            >
              <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-semibold text-zinc-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              All users
            </h2>
          </div>
          {isPending ? (
            <div className="py-12 text-center text-zinc-400 text-sm">
              Loading users...
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                <tr>
                  {["Name", "Email", "Role", "Verified", "Joined"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                          u.role === "ADMIN"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : u.role === "MODERATOR"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                          u.emailVerified
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {u.emailVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
