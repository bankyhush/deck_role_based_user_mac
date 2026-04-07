import { cookies } from "next/headers";
import { verifyAccessToken, JwtPayload } from "@/lib/jwt";

export async function getAuth(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}
