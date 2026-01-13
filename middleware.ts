import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("token")?.value;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  const isDashboard =
    pathname.startsWith("/dashboard");

  // 🔒 Block dashboard if not logged in
  if (isDashboard && !token) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  // 🔁 Prevent opening login/register when already logged in
  if (isAuthPage && token) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
