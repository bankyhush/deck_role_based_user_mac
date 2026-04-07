import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 },
  );

  // clear both tokens
  response.cookies.set("access_token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/api/auth/refresh",
  });

  return response;
}
