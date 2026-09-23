import { NextRequest, NextResponse } from "next/server";
import { getStatutoryOutbox, dispatchStatutoryEmail } from "@/lib/notifier";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const outbox = getStatutoryOutbox();
    return NextResponse.json(outbox);
  } catch {
    return NextResponse.json(getStatutoryOutbox());
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth([Role.OFFICER, Role.ADMIN]);
    const body = await req.json();
    const { to, subject, message } = body;

    const entry = await dispatchStatutoryEmail({
      to: to || user.email,
      recipientName: user.name || "Procurement Officer",
      subject: subject || "[BidBridge] Statutory Notification Dispatch Test",
      title: message || "This is an official statutory dispatch test message.",
      tenderRef: "TEST-DISPATCH",
      bodyHtml: `<h3>Statutory Email Dispatch Verification</h3><p>${message || "This is an automated test message from the BidBridge Statutory Notification Engine."}</p><p>Recipient: ${to || user.email}</p><p>Timestamp: ${new Date().toISOString()}</p>`,
      userId: user.id,
    });

    return NextResponse.json({ success: true, entry });
  } catch (e: any) {
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError") {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    console.error("Outbox dispatch test failed:", e);
    return NextResponse.json({ error: e.message || "Failed to dispatch test notification" }, { status: 500 });
  }
}
