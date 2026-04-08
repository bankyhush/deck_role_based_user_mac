"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import api from "@/lib/axiosInstance";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  emailVerified: boolean;
}

export default function EditUserClient() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"USER" | "MODERATOR" | "ADMIN">("USER");
  const [emailVerified, setEmailVerified] = useState(false);

  const { data: user, isPending } = useQuery<User>({
    queryKey: ["admin-user", id],
    queryFn: async () => {
      const res = await api.get(`/api/admin/users/${id}`);
      return res.data.data;
    },
    staleTime: 0,
  });

  // ✅ pre-fill form
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setEmailVerified(user.emailVerified);
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      role: string;
      emailVerified: boolean;
    }) => {
      const res = await api.put(`/api/admin/users/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      toast.success("User updated!");
      router.push(`/admin/users/${id}`);
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message || "Failed to update user"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return toast.error("Name and email are required");
    updateUserMutation.mutate({ name, email, role, emailVerified });
  };

  const inputClass =
    "px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white w-full";

  if (isPending)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <span className="text-zinc-400 text-sm">Loading user...</span>
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
            Edit user
          </h1>
          <p className="text-sm text-zinc-400 mb-6">
            Update details for {user?.name}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["USER", "MODERATOR", "ADMIN"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition ${
                      role === r
                        ? r === "ADMIN"
                          ? "bg-red-500 text-white border-red-500"
                          : r === "MODERATOR"
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                        : "bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Email verified toggle */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email verified
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Manually verify or unverify this user
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailVerified(!emailVerified)}
                className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                  emailVerified
                    ? "bg-green-500"
                    : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                    emailVerified
                      ? "left-5 bg-white"
                      : "left-1 bg-white dark:bg-zinc-400"
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={updateUserMutation.isPending}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition ${
                  updateUserMutation.isPending
                    ? "bg-zinc-400 cursor-not-allowed"
                    : "bg-zinc-900 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                }`}
              >
                {updateUserMutation.isPending ? "Saving..." : "Save changes"}
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
