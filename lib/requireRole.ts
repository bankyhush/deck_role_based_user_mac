import { cookies } from "next/headers";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/jwt";
import { redirect } from "next/navigation";

type Role = "USER" | "MODERATOR" | "ADMIN";

const ROLE_RANK: Record<Role, number> = {
  USER: 1,
  MODERATOR: 2,
  ADMIN: 3,
};

export async function requireRole(minimumRole: Role) {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // check access token first
  const accessUser = accessToken ? verifyAccessToken(accessToken) : null;

  // fall back to refresh token if access expired
  const refreshUser =
    !accessUser && refreshToken ? verifyRefreshToken(refreshToken) : null;

  const user = accessUser ?? refreshUser;

  if (!user) redirect("/login");

  if (ROLE_RANK[user.role] < ROLE_RANK[minimumRole]) {
    redirect("/");
  }

  return user;
}
