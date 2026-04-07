import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
      const res = await axios.get("/api/auth/me");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
