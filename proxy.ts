/**
 * proxy.ts  (Next.js 16 — renamed from middleware.ts)
 * Protects all /finance routes (except /finance/login).
 * Checks for the fp_session cookie set by the password-gate auth action.
 */

import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "fp_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to /finance and /api/finance routes
  if (!pathname.startsWith("/finance") && !pathname.startsWith("/api/finance")) {
    return NextResponse.next();
  }

  // Webhook routes verify their own signatures — skip cookie check
  if (pathname.startsWith("/api/finance/webhooks")) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/finance/login";
  const isAuthenticated = request.cookies.get(SESSION_COOKIE)?.value === "authenticated";

  // Unauthenticated → redirect to login
  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL("/finance/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already authenticated on login page → redirect to dashboard
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/finance/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/finance",
    "/finance/:path*",
    "/api/finance/:path*",
  ],
};
