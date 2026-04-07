import prisma from "@/connection/db";
import { requireApiRole } from "@/lib/requireApiRole";
import { NextResponse } from "next/server";

export async function GET() {
  const { user, error } = await requireApiRole("MODERATOR");
  if (error) return error;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
