import { NextResponse } from "next/server";

interface registerType {
  name: string;
  email: string;
  password: string;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password } = body as registerType;

  try {
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register user" },
      { status: 500 },
    );
  }
}
