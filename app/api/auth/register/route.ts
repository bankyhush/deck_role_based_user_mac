import prisma from "@/connection/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { sendVerificationEmail } from "@/lib/mailer";
import crypto from "crypto";
import { setTokenCookies } from "@/lib/setTokenCookies";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ generate a secure random verification token
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verifyToken,
      },
    });

    // ✅ send verification email
    await sendVerificationEmail(email, verifyToken);

    const payload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const { password: _, verifyToken: __, ...safeUser } = newUser;

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful! Please verify your email.",
        data: safeUser,
      },
      { status: 201 },
    );

    return setTokenCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
