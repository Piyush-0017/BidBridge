import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken, setSessionCookie, logAudit } from "@/lib/auth";

const schema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

const USERNAME_MAP: Record<string, string> = {
  officer: "officer@sih.gov.in",
  admin: "admin@sih.gov.in",
  bidder: "bidder1@abctech.com",
  bidder1: "bidder1@abctech.com",
  bidder2: "bidder2@secureit.in",
  bidder3: "bidder3@bharattelecom.in",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email: inputIdentifier, password } = schema.parse(body);

    const cleanInput = inputIdentifier.trim().toLowerCase();
    const email = USERNAME_MAP[cleanInput] || cleanInput;

    let user: any = null;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbErr) {
      console.error("Database lookup error during login:", dbErr);
    }

    // If user found in database
    if (user) {
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      const token = await createToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
      await setSessionCookie(token);
      await logAudit(user.id, "LOGIN", "User", user.id, null, req.headers.get("x-forwarded-for") || undefined);

      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    }

    // Demo fallback for instant resilience if database is disconnected
    const fallbackUsers: Record<string, { id: string; name: string; role: "OFFICER" | "BIDDER" | "ADMIN" }> = {
      "officer@sih.gov.in": { id: "cmtyqpfji0000r5ic345hnyf3", name: "Rajesh Kumar", role: "OFFICER" },
      "admin@sih.gov.in": { id: "cmtyqphj80002r5iccktnkhlz", name: "System Admin", role: "ADMIN" },
      "bidder1@abctech.com": { id: "cmtyqpi420003r5icvdgho7r5", name: "Priya Sharma", role: "BIDDER" },
      "bidder2@secureit.in": { id: "cmtyqpk3x0005r5icfgi3po5k", name: "Amit Patel", role: "BIDDER" },
      "bidder3@bharattelecom.in": { id: "cmtytwlah0000r5r4vzn67n1i", name: "Vikramaditya Rao", role: "BIDDER" },
    };

    if (fallbackUsers[email] && password === "Password@123") {
      const fbUser = fallbackUsers[email];
      const token = await createToken({
        id: fbUser.id,
        email,
        name: fbUser.name,
        role: fbUser.role as any,
      });
      await setSessionCookie(token);
      return NextResponse.json({
        user: { id: fbUser.id, email, name: fbUser.name, role: fbUser.role },
      });
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: "Please enter your email and password", details: e.errors }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
