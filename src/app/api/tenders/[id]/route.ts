import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { Role, TenderStatus } from "@prisma/client";
import { z } from "zod";
import {
  validateTenderTransition,
  isTenderAcceptingBids,
} from "@/lib/stateMachines";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tender = await prisma.tender.findUnique({
      where: { id },
      include: {
        requirements: true,
        documents: true,
        corrigenda: { orderBy: { publishedAt: "desc" } },
        bids: {
          include: {
            bidder: {
              select: { id: true, name: true, email: true, bidderProfile: true },
            },
            recommendation: true,
            decision: true,
            riskResult: true,
          },
        },
      },
    });

    if (!tender) {
      return NextResponse.json({ error: "Tender not found" }, { status: 404 });
    }

    return NextResponse.json(tender);
  } catch (e: any) {
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError")
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    console.error("Tender GET failed:", e);
    return NextResponse.json({ error: "Failed to fetch tender" }, { status: 500 });
  }
}

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TenderStatus).optional(),
  bidEndAt: z.string().datetime({ offset: true }).optional(),
  estimatedValue: z.number().positive().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth([Role.OFFICER, Role.ADMIN]);
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    // Fetch existing tender to check current state
    const existing = await prisma.tender.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Tender not found" }, { status: 404 });
    }

    // ── State Machine Enforcement ──────────────────────────────────────────
    if (data.status && data.status !== existing.status) {
      const transitionError = validateTenderTransition(
        existing.status,
        data.status
      );
      if (transitionError) {
        return NextResponse.json(
          { error: transitionError, code: "INVALID_STATE_TRANSITION" },
          { status: 422 }
        );
      }
    }

    // Prevent edits to a terminal-state tender (AWARDED or CANCELLED)
    if (
      existing.status === TenderStatus.AWARDED ||
      existing.status === TenderStatus.CANCELLED
    ) {
      return NextResponse.json(
        {
          error: `Tender is in terminal state (${existing.status}) and cannot be modified.`,
          code: "TENDER_TERMINAL_STATE",
        },
        { status: 422 }
      );
    }

    const tender = await prisma.tender.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        bidEndAt: data.bidEndAt ? new Date(data.bidEndAt) : undefined,
        estimatedValue: data.estimatedValue,
      },
    });

    await logAudit(user.id, "TENDER_UPDATE", "Tender", id, {
      previousStatus: existing.status,
      newStatus: data.status,
      changes: data,
    });

    return NextResponse.json(tender);
  } catch (e: any) {
    if (e.name === "ZodError")
      return NextResponse.json(
        { error: "Validation failed", details: e.errors },
        { status: 400 }
      );
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError")
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    console.error("Tender PATCH failed:", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
