import prisma from "@/connection/db";
import { getAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

interface HistoryType {
  amount: number;
  type: string;
  action: string;
  status: string;
}

export async function POST(req: Request) {
  const auth = await getAuth();
  if (!auth)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );

  const body = await req.json();
  const { amount, type, action, status } = body as HistoryType;

  if (!amount || !type || !action || !status) {
    return NextResponse.json(
      { success: false, message: "All fields are required" },
      { status: 400 },
    );
  }

  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { success: false, message: "Amount must be a positive number" },
      { status: 400 },
    );
  }

  const validTypes = ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT"];
  const validActions = ["CREDIT", "DEBIT"];
  const validStatuses = ["PENDING", "SUCCESS", "FAILED"];

  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { success: false, message: "Invalid transaction type" },
      { status: 400 },
    );
  }

  if (!validActions.includes(action)) {
    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 },
    );
  }

  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { success: false, message: "Invalid status" },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: auth.id } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const history = await prisma.history.create({
      data: {
        userId: auth.id, // from token — never from frontend
        amount,
        type,
        action,
        status,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Transaction recorded successfully",
        data: history,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("History create error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
