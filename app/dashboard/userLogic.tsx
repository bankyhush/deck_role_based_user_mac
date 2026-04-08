"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { useMe } from "@/hooks/useMe";
import api from "@/lib/axiosInstance";

interface History {
  id: string;
  amount: number;
  type: string;
  action: string;
  status: string;
  timestamp: string;
}

interface Props {
  user: { id: string; email: string; role: "USER" | "MODERATOR" | "ADMIN" };
}

export default function DashboardLogic({ user: serverUser }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user } = useMe();

  const { data: histories, isPending: historyLoading } = useQuery<History[]>({
    queryKey: ["histories"],
    queryFn: async () => {
      const res = await api.get("/api/user/history/view");
      return res.data.data;
    },
  });

  const handleLogout = async () => {
    await api.post("/api/auth/logout");
    queryClient.clear();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "..";

  const statusColor: Record<string, string> = {
    SUCCESS:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    PENDING:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Good morning, {user?.name ?? "..."} 👋
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {user?.role}
            </span>

            {/* show moderator link if role allows */}
            {(user?.role === "MODERATOR" || user?.role === "ADMIN") && (
              <Link href="/moderator">
                <button className="px-3 py-2 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  Moderator
                </button>
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <Link href="/admin">
                <button className="px-3 py-2 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                  Admin
                </button>
              </Link>
            )}

            <Link href="/profile">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-300 cursor-pointer hover:opacity-80 transition">
                {initials}
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Email not verified warning */}
        {user && !user.emailVerified && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Email not verified
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                Please verify your email to unlock all features.
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  await api.post("/api/auth/resend-verification", {
                    email: user.email,
                  });
                  toast.success("Verification email sent!");
                } catch (error: any) {
                  toast.error(
                    error.response?.data?.message || "Failed to resend",
                  );
                }
              }}
              className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
            >
              Resend verification
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: histories?.length ?? 0 },
            {
              label: "Successful",
              value:
                histories?.filter((h) => h.status === "SUCCESS").length ?? 0,
            },
            {
              label: "Pending",
              value:
                histories?.filter((h) => h.status === "PENDING").length ?? 0,
            },
            {
              label: "Failed",
              value:
                histories?.filter((h) => h.status === "FAILED").length ?? 0,
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

        <Link href="/dashboard/createhistory" className="mb-6 inline-block">
          <button className="cursor-pointer px-3 py-2 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            Create History
          </button>
        </Link>

        {/* History table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Transaction history
            </h2>
          </div>
          {historyLoading ? (
            <div className="py-12 text-center text-zinc-400 text-sm">
              Loading...
            </div>
          ) : histories?.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-sm">
              No transactions yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                <tr>
                  {["Type", "Action", "Amount", "Status", "Date"].map((h) => (
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
                {histories?.map((h) => (
                  <tr
                    key={h.id}
                    className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                  >
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                      {h.type}
                    </td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                      {h.action}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                      ${h.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusColor[h.status] ?? "bg-zinc-100 text-zinc-500"}`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {new Date(h.timestamp).toLocaleDateString("en-US", {
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
