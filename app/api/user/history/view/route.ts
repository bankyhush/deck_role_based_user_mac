import prisma from "@/connection/db";
import { getAuth } from "@/lib/auth";
import { withCache, CacheKeys, CacheTTL } from "@/lib/cache";
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

    // user's own history — userScoped pattern
    const histories = await withCache(
      CacheKeys.userScoped("history", auth.id),
      () =>
        prisma.history.findMany({
          where: { userId: auth.id },
          orderBy: { timestamp: "desc" },
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        }),
      CacheTTL.SHORT,
    );

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
