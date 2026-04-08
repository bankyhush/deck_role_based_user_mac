"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

interface History {
  id: string;
  amount: number;
  type: string;
  action: string;
  status: string;
  timestamp: string;
}

export default function EditHistoryClient() {
  const { id, historyId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("");

  const { data: history, isPending } = useQuery<History>({
    queryKey: ["admin-history", historyId],
    queryFn: async () => {
      const res = await axios.get(
        `/api/admin/users/${id}/history/${historyId}`,
      );
      return res.data.data;
    },
    staleTime: 0,
  });

  // ✅ pre-fill form
  useEffect(() => {
    if (history) {
      setAmount(String(history.amount));
      setType(history.type);
      setAction(history.action);
      setStatus(history.status);
    }
  }, [history]);

  const editHistoryMutation = useMutation({
    mutationFn: async (data: {
      amount: number;
      type: string;
      action: string;
      status: string;
    }) => {
      const res = await axios.put(
        `/api/admin/users/${id}/history/${historyId}`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-history", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-history", historyId] });
      toast.success("History updated!");
      router.push(`/admin/users/${id}`);
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message || "Failed to update history"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !type || !action || !status)
      return toast.error("Fill all fields");
    if (isNaN(Number(amount)) || Number(amount) <= 0)
      return toast.error("Amount must be a positive number");
    editHistoryMutation.mutate({
      amount: Number(amount),
      type,
      action,
      status,
    });
  };

  const TYPE_OPTIONS = ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT"];
  const ACTION_OPTIONS = ["CREDIT", "DEBIT"];
  const STATUS_OPTIONS = ["PENDING", "SUCCESS", "FAILED"];

  const inputClass =
    "px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white w-full";

  if (isPending)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <span className="text-zinc-400 text-sm">Loading...</span>
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-lg mx-auto">
        <Link
          href={`/admin/users/${id}`}
          className="text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition mb-6 inline-block"
        >
          ← Back to user
        </Link>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white mb-1">
            Edit transaction
          </h1>
          <p className="text-sm text-zinc-400 mb-6">
            Modify this transaction record
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TYPE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition ${
                      type === t
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                        : "bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Action
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ACTION_OPTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAction(a)}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition ${
                      action === a
                        ? a === "CREDIT"
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-red-500 text-white border-red-500"
                        : "bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition ${
                      status === s
                        ? s === "SUCCESS"
                          ? "bg-green-600 text-white border-green-600"
                          : s === "FAILED"
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-amber-500 text-white border-amber-500"
                        : "bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={editHistoryMutation.isPending}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition ${
                  editHistoryMutation.isPending
                    ? "bg-zinc-400 cursor-not-allowed"
                    : "bg-zinc-900 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                }`}
              >
                {editHistoryMutation.isPending ? "Saving..." : "Save changes"}
              </button>
              <Link href={`/admin/users/${id}`} className="flex-1">
                <button
                  type="button"
                  className="w-full py-2.5 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
