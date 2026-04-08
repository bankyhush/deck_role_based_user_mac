import prisma from "@/connection/db";
import { requireApiRole } from "@/lib/requireApiRole";
import { NextResponse } from "next/server";

interface Params {
  id: string;
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  const { user, error } = await requireApiRole("ADMIN");
  if (error) return error;

  const { id } = await params;

  // prevent admin from deleting themselves
  if (user!.id === id) {
    return NextResponse.json(
      { success: false, message: "You cannot delete your own account" },
      { status: 400 },
    );
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json(
    { success: true, message: "User deleted" },
    { status: 200 },
  );
}
