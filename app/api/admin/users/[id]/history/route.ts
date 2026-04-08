import prisma from "@/connection/db";
import { requireApiRole } from "@/lib/requireApiRole";
import { NextResponse } from "next/server";

interface Params {
  id: string;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  const { error } = await requireApiRole("ADMIN");
  if (error) return error;

  const { id } = await params;

  try {
    const histories = await prisma.history.findMany({
      where: { userId: id },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json(
      { success: true, data: histories },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
