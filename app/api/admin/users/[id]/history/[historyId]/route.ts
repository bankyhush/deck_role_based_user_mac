import prisma from "@/connection/db";
import { requireApiRole } from "@/lib/requireApiRole";
import { NextResponse } from "next/server";

interface Params {
  id: string;
  historyId: string;
}

// GET single history
export async function GET(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  const { error } = await requireApiRole("ADMIN");
  if (error) return error;

  const { historyId } = await params;

  try {
    const history = await prisma.history.findUnique({
      where: { id: historyId },
    });

    if (!history) {
      return NextResponse.json(
        { success: false, message: "History not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: history }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT edit history
export async function PUT(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  const { error } = await requireApiRole("ADMIN");
  if (error) return error;

  const { historyId } = await params;
  const { amount, type, action, status } = await req.json();

  if (!amount || !type || !action || !status) {
    return NextResponse.json(
      { success: false, message: "All fields are required" },
      { status: 400 },
    );
  }

  const validTypes = ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT"];
  const validActions = ["CREDIT", "DEBIT"];
  const validStatuses = ["PENDING", "SUCCESS", "FAILED"];

  if (
    !validTypes.includes(type) ||
    !validActions.includes(action) ||
    !validStatuses.includes(status)
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid field values" },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.history.update({
      where: { id: historyId },
      data: { amount: Number(amount), type, action, status },
    });

    return NextResponse.json(
      { success: true, message: "History updated successfully", data: updated },
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
