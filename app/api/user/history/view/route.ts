import prisma from "@/connection/db";
import { getAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await getAuth();
  if (!auth)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );

  try {
    const user = await prisma.user.findUnique({ where: { id: auth.id } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const histories = await prisma.history.findMany({
      where: { userId: auth.id },
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: histories },
      { status: 200 },
    );
  } catch (error) {
    console.error("History view error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
