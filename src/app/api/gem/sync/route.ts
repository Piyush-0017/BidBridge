import { NextRequest, NextResponse } from "next/server";
import { requireAuth, logAudit } from "@/lib/auth";
import { OFFICIAL_GEM_CATALOGUE, findGeMTender, GeMTenderOpportunity } from "@/lib/gemBridge";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("q") || "";
    
    // Check existing tenders in DB to dynamically flag isSynced
    let existingRefs = new Set<string>();
    try {
      const dbTenders = await prisma.tender.findMany({
        select: { referenceNo: true },
      });
      dbTenders.forEach((t) => existingRefs.add(t.referenceNo));
    } catch {
      // Fallback
    }

    const catalogueWithSyncStatus = OFFICIAL_GEM_CATALOGUE.map((item) => ({
      ...item,
      isSynced: existingRefs.has(item.bidNumber) || item.isSynced,
    })).filter((item) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        item.bidNumber.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.ministry.toLowerCase().includes(q)
      );
    });

    return NextResponse.json({
      success: true,
      tenders: catalogueWithSyncStatus,
      totalCount: catalogueWithSyncStatus.length,
      syncedCount: catalogueWithSyncStatus.filter((t) => t.isSynced).length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch GeM catalog" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { bidNumber, syncAll } = body;

    let targets: GeMTenderOpportunity[] = [];

    if (syncAll) {
      targets = OFFICIAL_GEM_CATALOGUE;
    } else if (bidNumber) {
      const found = findGeMTender(bidNumber);
      if (!found) {
        return NextResponse.json({ error: `GeM Bid Number ${bidNumber} not found in catalog.` }, { status: 404 });
      }
      targets = [found];
    } else {
      return NextResponse.json({ error: "Specify bidNumber or syncAll: true" }, { status: 400 });
    }

    const syncedResults: any[] = [];

    for (const item of targets) {
      try {
        const existing = await prisma.tender.findFirst({
          where: { referenceNo: item.bidNumber },
        });

        if (!existing) {
          const created = await prisma.tender.create({
            data: {
              referenceNo: item.bidNumber,
              title: item.title,
              department: `${item.ministry} • ${item.department}`,
              category: item.category,
              description: `Imported via GeM SPV National Procurement Gateway. MII Min: ${item.localContentMin}%, EMD: ₹${item.emdAmount}.`,
              estimatedValue: item.estimatedCost,
              bidEndAt: new Date(item.endDate),
              status: "OPEN",
              source: "GEM",
            },
          });
          syncedResults.push(created);
        } else {
          syncedResults.push(existing);
        }
      } catch {
        // Local in-memory fallback
        syncedResults.push({
          referenceNo: item.bidNumber,
          title: item.title,
          department: item.department,
          estimatedValue: item.estimatedCost,
          status: "OPEN",
        });
      }

      await logAudit(user.id, "GEM_TENDER_SYNCED", "Tender", item.bidNumber, {
        bidNumber: item.bidNumber,
        title: item.title,
        source: "Government e-Marketplace (GeM SPV)",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${syncedResults.length} tender(s) from Government e-Marketplace.`,
      syncedCount: syncedResults.length,
      tenders: syncedResults,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "GeM sync failure" }, { status: 500 });
  }
}
