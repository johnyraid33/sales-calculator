import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow login, logout, and login page
  if (path === "/api/login" || path === "/api/logout" || path === "/login") {
    return NextResponse.next();
  }

  // Get session token from cookie
  const session = request.cookies.get("session")?.value;
  const isAuthenticated = await verifySession(session);

  // If requesting API routes without auth, return 401
  if (path.startsWith("/api/")) {
    if (!isAuthenticated) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }
    return NextResponse.next();
  }

  // If requesting pages without auth, redirect to /login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static public assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
