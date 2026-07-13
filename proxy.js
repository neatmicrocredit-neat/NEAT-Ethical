import { NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard"];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const isAuthenticated = request.cookies.get("auth")?.value === "true";

  if (!isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
