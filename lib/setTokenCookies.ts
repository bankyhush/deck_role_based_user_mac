import { NextResponse } from "next/server";

export function setTokenCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
) {
  response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15, // 15 minutes
    path: "/",
  });

  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/api/auth/refresh", // only sent to refresh endpoint
  });

  return response;
}
