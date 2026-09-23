import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSession, logAudit } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (user) {
    await logAudit(user.id, "LOGOUT", "User", user.id);
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
