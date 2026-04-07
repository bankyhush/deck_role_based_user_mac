import prisma from "@/connection/db";
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, message: "Email already verified" },
        { status: 400 },
      );
    }

    // ✅ generate a fresh token
    const verifyToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { email },
      data: { verifyToken },
    });

    await sendVerificationEmail(email, verifyToken);

    return NextResponse.json(
      { success: true, message: "Verification email resent!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
