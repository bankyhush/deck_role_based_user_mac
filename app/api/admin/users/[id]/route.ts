import prisma from "@/connection/db";
import { requireApiRole } from "@/lib/requireApiRole";
import { withCache, deleteCache, CacheKeys, CacheTTL } from "@/lib/cache";
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
    const foundUser = await withCache(
      CacheKeys.single("user", id),
      () =>
        prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      CacheTTL.MEDIUM,
    );

    if (!foundUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: foundUser },
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  const { error } = await requireApiRole("ADMIN");
  if (error) return error;

  const { id } = await params;

  try {
    const { name, email, emailVerified } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 },
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { name, email, emailVerified },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    await deleteCache(
      CacheKeys.single("user", id),
      CacheKeys.user(id),
      CacheKeys.adminScoped("users"),
    );

    return NextResponse.json(
      { success: true, message: "User updated successfully", data: updated },
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  const { user, error } = await requireApiRole("ADMIN");
  if (error) return error;

  const { id } = await params;

  if (user!.id === id) {
    return NextResponse.json(
      { success: false, message: "You cannot delete your own account" },
      { status: 400 },
    );
  }

  try {
    await prisma.user.delete({ where: { id } });

    await deleteCache(
      CacheKeys.single("user", id),
      CacheKeys.user(id),
      CacheKeys.adminScoped("users"),
      CacheKeys.userScoped("history", id),
    );

    return NextResponse.json(
      { success: true, message: "User deleted" },
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
