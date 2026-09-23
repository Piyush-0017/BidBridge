import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(notifications);
  } catch (e: any) {
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError")
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    console.error("Notifications GET failed:", e);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { id, all } = body;

    if (all) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
    } else if (id) {
      // Scoped update: ensure the notification belongs to the authenticated user
      await prisma.notification.updateMany({
        where: { id, userId: user.id },
        data: { read: true },
      });
    } else {
      return NextResponse.json(
        { error: "Provide either 'id' or 'all: true'" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError")
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    console.error("Notifications PATCH failed:", e);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
