import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from "@/lib/jwt";
import { setTokenCookies } from "@/lib/setTokenCookies";
import { rateLimitByIp, RateLimits } from "@/lib/rateLimit";

export async function POST(req: Request) {
  // rate limit by IP for refresh token endpoint
  const limited = await rateLimitByIp(req, RateLimits.REFRESH_TOKEN, "refresh");
  if (limited) return limited;

  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token" },
        { status: 401 },
      );
    }

    // verify the refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired refresh token" },
        { status: 401 },
      );
    }

    // issue brand new both tokens (rotation)
    const newAccessToken = signAccessToken({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });

    const newRefreshToken = signRefreshToken({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });

    const response = NextResponse.json(
      { success: true, message: "Token refreshed" },
      { status: 200 },
    );

    // set both new tokens in cookies
    return setTokenCookies(response, newAccessToken, newRefreshToken);
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
