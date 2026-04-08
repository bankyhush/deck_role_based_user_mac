import prisma from "@/connection/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { setTokenCookies } from "@/lib/setTokenCookies";
import { rateLimitByIp, RateLimits } from "@/lib/rateLimit";

export async function POST(req: Request) {
  // rate limit by IP for login endpoint
  const limited = await rateLimitByIp(req, RateLimits.LOGIN, "login");
  if (limited) return limited;

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 400 },
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 400 },
      );
    }

    // block login if email not verified
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email before logging in",
        },
        { status: 403 },
      );
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const { password: _, verifyToken: __, ...safeUser } = user;

    const response = NextResponse.json(
      { success: true, message: "Login successful", data: safeUser },
      { status: 200 },
    );

    return setTokenCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
