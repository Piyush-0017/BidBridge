import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const session = await requireAuth();
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
    return NextResponse.json(user);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Login required" }, { status: 401 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  companyName: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  udyamNumber: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = updateSchema.parse(body);

    if (data.name) {
      await prisma.user.update({ where: { id: session.id }, data: { name: data.name } });
    }

    if (session.role === Role.BIDDER) {
      await prisma.bidderProfile.update({
        where: { userId: session.id },
        data: {
          companyName: data.companyName,
          gstin: data.gstin,
          pan: data.pan,
          udyamNumber: data.udyamNumber,
          address: data.address,
        },
      });
    }

    if (session.role === Role.OFFICER || session.role === Role.ADMIN) {
      const profile = await prisma.officerProfile.findUnique({ where: { userId: session.id } });
      if (profile) {
        await prisma.officerProfile.update({
          where: { userId: session.id },
          data: {
            department: data.department,
            designation: data.designation,
          },
        });
      }
    }

    await logAudit(session.id, "PROFILE_UPDATE", "User", session.id, data);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Login required" }, { status: 401 });
    if (e.name === "ZodError") return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
