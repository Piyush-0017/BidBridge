import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bidderProfile: true,
        officerProfile: true,
      },
    });
    if (user) return NextResponse.json({ user });
  } catch (err) {
    // fallback to session object
  }

  return NextResponse.json({ user: session });
}
