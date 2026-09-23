import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "CHANGE_TO_LONG_RANDOM_SECRET_IN_PRODUCTION_32CHARS+"
);
const COOKIE_NAME = "sih_session";

// Public API routes that do NOT require authentication
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/signup",
  "/api/health",
];

// Public page routes that do NOT require authentication
const PUBLIC_PAGE_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/bidder-guide",
];

async function getSessionUser(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: string; email: string; role: string; name: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always pass through: Next.js internal bundles, static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/manpower-worker.png"
  ) {
    return NextResponse.next();
  }

  // Pass through public page routes
  if (
    PUBLIC_PAGE_ROUTES.includes(pathname) ||
    pathname.startsWith("/bidder-guide/")
  ) {
    return NextResponse.next();
  }

  // ─── API Route Protection ─────────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    // Public API endpoints — no auth needed
    if (PUBLIC_API_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
      return NextResponse.next();
    }

    // All other API routes require a valid session
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required. Please sign in to access this resource.",
          code: "NO_SESSION",
        },
        { status: 401 }
      );
    }

    // Role-based API protection
    // Officer-only API routes
    if (
      pathname.startsWith("/api/decisions") ||
      pathname.startsWith("/api/audit") ||
      pathname.startsWith("/api/reports")
    ) {
      if (session.role === "BIDDER") {
        return NextResponse.json(
          {
            error: "Forbidden",
            message: "Access denied: Insufficient permissions for this resource.",
            code: "ROLE_FORBIDDEN",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  }

  // ─── Page Route Protection ────────────────────────────────────────────────
  const session = await getSessionUser(req);

  // If visiting /login while already logged in, redirect to user's assigned panel
  if (pathname === "/login") {
    if (session) {
      if (session.role === "OFFICER" || session.role === "ADMIN") {
        return NextResponse.redirect(new URL("/officer", req.url));
      }
      return NextResponse.redirect(new URL("/bidder", req.url));
    }
    return NextResponse.next();
  }

  // Officer route protection: only OFFICER or ADMIN allowed
  if (pathname === "/officer" || pathname.startsWith("/officer/")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role === "BIDDER") {
      return NextResponse.redirect(new URL("/bidder", req.url));
    }
    return NextResponse.next();
  }

  // Bidder route protection: only BIDDER allowed
  if (pathname === "/bidder" || pathname.startsWith("/bidder/")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role === "OFFICER" || session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/officer", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
