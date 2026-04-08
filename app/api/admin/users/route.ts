import prisma from "@/connection/db";
import { requireApiRole } from "@/lib/requireApiRole";
import { withCache, CacheKeys, CacheTTL } from "@/lib/cache";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireApiRole("ADMIN");
  if (error) return error;

  try {
    const users = await withCache(
      CacheKeys.adminScoped("users"),
      () =>
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        }),
      CacheTTL.SHORT,
    );

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
