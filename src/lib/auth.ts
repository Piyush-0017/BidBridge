import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";
import { isDemoMode } from "./env";

export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message = "Unauthorized: Authentication required. No active session found.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message = "Forbidden: Insufficient role permissions.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

const secretKeyString = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "sih26100_development_fallback_secret_key_32chars+");
if (!secretKeyString && process.env.NODE_ENV === "production") {
  throw new Error("FATAL CONFIGURATION ERROR: JWT_SECRET environment variable is missing in production environment!");
}
const JWT_SECRET = new TextEncoder().encode(secretKeyString || "sih26100_development_fallback_secret_key_32chars+");
const COOKIE_NAME = "sih_session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: SessionUser) {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth(roles?: Role[]): Promise<SessionUser> {
  const user = await getSession();

  if (user) {
    if (roles && !roles.includes(user.role)) {
      throw new ForbiddenError(`Access denied: Required role (${roles.join(", ")}), current role (${user.role})`);
    }
    return user;
  }

  // DEMO_MODE is only allowed in non-production environments (enforced via env.ts)
  // It provides read-only guest access for hackathon judging demonstrations only.
  if (isDemoMode) {
    if (roles && (roles.includes(Role.OFFICER) || roles.includes(Role.ADMIN))) {
      return {
        id: "officer-demo",
        email: "officer@demo.sih.gov.in",
        name: "[DEMO] Procurement Officer",
        role: Role.OFFICER,
      };
    }
    return {
      id: "bidder-demo",
      email: "bidder@demo.sih.gov.in",
      name: "[DEMO] Bidder Account",
      role: Role.BIDDER,
    };
  }

  // No active session and DEMO_MODE is off — reject with 401
  throw new UnauthorizedError("Authentication required: No active session. Please sign in to continue.");
}

export async function logAudit(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId?: string,
  details?: any,
  ip?: string
) {
  try {
    const { logImmutableAudit } = await import("./auditChain");
    return await logImmutableAudit(actorId, action, entityType, entityId, details, ip);
  } catch (err) {
    // Log the failure to console — do NOT silently swallow audit errors.
    // The audit chain is a compliance requirement; failures must be visible.
    console.error("[AUDIT ERROR] Failed to write to immutable audit chain:", err);
  }
}
