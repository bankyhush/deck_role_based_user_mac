import prisma from "@/connection/db";
import { requireApiRole } from "@/lib/requireApiRole";
import { NextResponse } from "next/server";

interface Params {
  id: string;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  const { user, error } = await requireApiRole("ADMIN");
  if (error) return error;

  const { id } = await params;
  const { role } = await req.json();

  if (!["USER", "MODERATOR", "ADMIN"].includes(role)) {
    return NextResponse.json(
      { success: false, message: "Invalid role" },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(
    { success: true, message: "Role updated", data: updated },
    { status: 200 },
  );
}
