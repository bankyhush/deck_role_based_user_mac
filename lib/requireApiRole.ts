import { getAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

type Role = "USER" | "MODERATOR" | "ADMIN";

const ROLE_RANK: Record<Role, number> = {
  USER: 1,
  MODERATOR: 2,
  ADMIN: 3,
};

export async function requireApiRole(minimumRole: Role) {
  const auth = await getAuth();

  if (!auth) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  if (ROLE_RANK[auth.role] < ROLE_RANK[minimumRole]) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, message: "Forbidden — insufficient role" },
        { status: 403 },
      ),
    };
  }

  return { user: auth, error: null };
}
