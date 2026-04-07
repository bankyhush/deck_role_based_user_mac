import prisma from "@/connection/db";
import { requireApiRole } from "@/lib/requireApiRole";
import { NextResponse } from "next/server";

export async function GET() {
  const { user, error } = await requireApiRole("ADMIN");
  if (error) return error;

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
}
