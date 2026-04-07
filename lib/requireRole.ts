import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import { redirect } from "next/navigation";

type Role = "USER" | "MODERATOR" | "ADMIN";

// role hierarchy — ADMIN > MODERATOR > USER
const ROLE_RANK: Record<Role, number> = {
  USER: 1,
  MODERATOR: 2,
  ADMIN: 3,
};

export async function requireRole(minimumRole: Role) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) redirect("/login");

  const user = verifyAccessToken(token);
  if (!user) redirect("/login");

  // ✅ check if user's role meets the minimum required
  if (ROLE_RANK[user.role] < ROLE_RANK[minimumRole]) {
    redirect("/unauthorized"); // ✅ not high enough role
  }

  return user;
}
