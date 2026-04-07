import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";

const protectedRoutes = ["/dashboard", "/profile", "/history"];
const adminRoutes = ["/admin"];
const moderatorRoutes = ["/moderator"];
const guestRoutes = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const user = token ? verifyAccessToken(token) : null;
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
  const isModeratorRoute = moderatorRoutes.some((r) => pathname.startsWith(r));
  const isGuestOnly = guestRoutes.some((r) => pathname.startsWith(r));

  // not logged in → redirect to login
  if ((isProtected || isAdminRoute || isModeratorRoute) && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // logged in + admin route + not admin → unauthorized
  if (isAdminRoute && user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // logged in + moderator route + not moderator or admin → unauthorized
  if (isModeratorRoute && user?.role === "USER") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // already logged in → redirect away from login/register
  if (isGuestOnly && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
