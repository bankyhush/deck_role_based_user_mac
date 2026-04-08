import api from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  emailVerified: boolean;
  createdAt: string;
}

export function useMe() {
  return useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/api/auth/me");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
