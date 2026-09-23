import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { TenderStatus, Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where = status ? { status: status as TenderStatus } : {};
  const tenders = await prisma.tender.findMany({
    where,
    include: {
      requirements: true,
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tenders);
}

const createSchema = z.object({
  referenceNo: z.string().min(3),
  title: z.string().min(5),
  department: z.string().min(2),
  category: z.string().min(2),
  description: z.string().optional(),
  estimatedValue: z.number().positive().optional(),
  bidEndAt: z.string().optional(),
  status: z.nativeEnum(TenderStatus).optional(),
  requirements: z
    .array(
      z.object({
        code: z.string(),
        description: z.string(),
        category: z.string(),
        mandatory: z.boolean().default(true),
        weight: z.number().optional(),
      })
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth([Role.OFFICER, Role.ADMIN]);
    const body = await req.json();
    const data = createSchema.parse(body);

    const tender = await prisma.tender.create({
      data: {
        referenceNo: data.referenceNo,
        title: data.title,
        department: data.department,
        category: data.category,
        description: data.description,
        estimatedValue: data.estimatedValue,
        bidEndAt: data.bidEndAt
          ? new Date(data.bidEndAt)
          : new Date(Date.now() + 15 * 86400000),
        status: data.status || TenderStatus.OPEN,
        requirements: data.requirements
          ? { create: data.requirements }
          : undefined,
      },
      include: { requirements: true },
    });

    await logAudit(user.id, "TENDER_CREATE", "Tender", tender.id, {
      referenceNo: tender.referenceNo,
    });

    return NextResponse.json(tender, { status: 201 });
  } catch (e: any) {
    if (e.name === "ZodError")
      return NextResponse.json(
        { error: "Validation failed", details: e.errors },
        { status: 400 }
      );
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError")
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    console.error("Tender create failed:", e);
    return NextResponse.json(
      { error: "Failed to create tender" },
      { status: 500 }
    );
  }
}
