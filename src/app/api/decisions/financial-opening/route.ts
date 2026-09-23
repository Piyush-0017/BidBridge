import { NextRequest, NextResponse } from "next/server";
import { requireAuth, logAudit } from "@/lib/auth";
import crypto from "crypto";

export interface DecryptedBOQItem {
  id: string;
  itemDescription: string;
  unit: string;
  qty: number;
  benchmarkRate: number;
  quotedRate: number;
  gstPercent: number;
  landedAmount: number;
  variancePercent: number;
  isAbnormallyLow: boolean;
}

export interface DecryptedBidderFinancial {
  bidId: string;
  bidderName: string;
  gstin: string;
  pan: string;
  technicalScore: number;
  totalQuoteLanded: number;
  rank: string;
  savingsVsBudget: number;
  savingsPercent: number;
  boqBreakdown: DecryptedBOQItem[];
}

// In-memory dual-key ceremony store
let ceremonyState = {
  isDecrypted: false,
  tenderRef: "GEM/2025/B/6123456",
  officer1: {
    name: "Rajesh Kumar",
    designation: "Deputy Secretary & Tender Inviting Authority (MHA)",
    signed: false,
    dscSerial: "4A:9C:21:8F:77:E1:02:4B",
    timestamp: null as string | null,
  },
  officer2: {
    name: "Dr. Sunita Verma",
    designation: "Joint Director (Finance) & Member Secretary",
    signed: false,
    dscSerial: "7B:3E:99:11:4C:D0:A2:18",
    timestamp: null as string | null,
  },
  decryptedAt: null as string | null,
  decryptionHash: null as string | null,
};

const SAMPLE_DECRYPTED_BIDS: DecryptedBidderFinancial[] = [
  {
    bidId: "bid-1",
    bidderName: "ABC Technology Private Limited",
    gstin: "27AABCU9603R1ZM",
    pan: "AABCU9603R",
    technicalScore: 98,
    totalQuoteLanded: 20558000,
    rank: "L1",
    savingsVsBudget: 4442000,
    savingsPercent: 17.8,
    boqBreakdown: [
      {
        id: "boq-1",
        itemDescription: "4K UHD Smart IP PTZ Camera with 30x Optical Zoom, Night Vision & IP67 Housing",
        unit: "Nos",
        qty: 50,
        benchmarkRate: 50000,
        quotedRate: 45000,
        gstPercent: 18,
        landedAmount: 2655000,
        variancePercent: -10.0,
        isAbnormallyLow: false,
      },
      {
        id: "boq-2",
        itemDescription: "64-Channel Enterprise Network Video Recorder (NVR) with RAID 6 Storage (128TB)",
        unit: "Nos",
        qty: 4,
        benchmarkRate: 320000,
        quotedRate: 280000,
        gstPercent: 18,
        landedAmount: 1321600,
        variancePercent: -12.5,
        isAbnormallyLow: false,
      },
      {
        id: "boq-3",
        itemDescription: "High-Grade Armoured Outdoor Cat-6 Ethernet Cable Spool (305 meters/drum)",
        unit: "Drums",
        qty: 25,
        benchmarkRate: 16000,
        quotedRate: 14500,
        gstPercent: 18,
        landedAmount: 427750,
        variancePercent: -9.4,
        isAbnormallyLow: false,
      },
      {
        id: "boq-4",
        itemDescription: "AI Surveillance Video Analytics Server Cluster (Face Detection, ANPR & Intrusion)",
        unit: "Sets",
        qty: 2,
        benchmarkRate: 750000,
        quotedRate: 650000,
        gstPercent: 18,
        landedAmount: 1534000,
        variancePercent: -13.3,
        isAbnormallyLow: false,
      },
      {
        id: "boq-5",
        itemDescription: "Installation, Commissioning, Civil Conduit Mounting & 3-Year Onsite Warranty Support",
        unit: "Lump Sum",
        qty: 1,
        benchmarkRate: 550000,
        quotedRate: 480000,
        gstPercent: 18,
        landedAmount: 566400,
        variancePercent: -12.7,
        isAbnormallyLow: false,
      },
    ],
  },
  {
    bidId: "bid-2",
    bidderName: "SecureIT Solutions LLP",
    gstin: "27AABCS8899Q1Z2",
    pan: "AABCS8899Q",
    technicalScore: 94,
    totalQuoteLanded: 22400000,
    rank: "L2",
    savingsVsBudget: 2600000,
    savingsPercent: 10.4,
    boqBreakdown: [
      {
        id: "boq-1",
        itemDescription: "4K UHD Smart IP PTZ Camera with 30x Optical Zoom, Night Vision & IP67 Housing",
        unit: "Nos",
        qty: 50,
        benchmarkRate: 50000,
        quotedRate: 48500,
        gstPercent: 18,
        landedAmount: 2861500,
        variancePercent: -3.0,
        isAbnormallyLow: false,
      },
      {
        id: "boq-2",
        itemDescription: "64-Channel Enterprise Network Video Recorder (NVR) with RAID 6 Storage (128TB)",
        unit: "Nos",
        qty: 4,
        benchmarkRate: 320000,
        quotedRate: 305000,
        gstPercent: 18,
        landedAmount: 1439600,
        variancePercent: -4.7,
        isAbnormallyLow: false,
      },
      {
        id: "boq-3",
        itemDescription: "High-Grade Armoured Outdoor Cat-6 Ethernet Cable Spool (305 meters/drum)",
        unit: "Drums",
        qty: 25,
        benchmarkRate: 16000,
        quotedRate: 15200,
        gstPercent: 18,
        landedAmount: 448400,
        variancePercent: -5.0,
        isAbnormallyLow: false,
      },
      {
        id: "boq-4",
        itemDescription: "AI Surveillance Video Analytics Server Cluster (Face Detection, ANPR & Intrusion)",
        unit: "Sets",
        qty: 2,
        benchmarkRate: 750000,
        quotedRate: 710000,
        gstPercent: 18,
        landedAmount: 1675600,
        variancePercent: -5.3,
        isAbnormallyLow: false,
      },
      {
        id: "boq-5",
        itemDescription: "Installation, Commissioning, Civil Conduit Mounting & 3-Year Onsite Warranty Support",
        unit: "Lump Sum",
        qty: 1,
        benchmarkRate: 550000,
        quotedRate: 520000,
        gstPercent: 18,
        landedAmount: 613600,
        variancePercent: -5.5,
        isAbnormallyLow: false,
      },
    ],
  },
  {
    bidId: "bid-3",
    bidderName: "Bharat Telematics & Defense Systems",
    gstin: "07AAACB1029K1Z4",
    pan: "AAACB1029K",
    technicalScore: 91,
    totalQuoteLanded: 24250000,
    rank: "L3",
    savingsVsBudget: 750000,
    savingsPercent: 3.0,
    boqBreakdown: [
      {
        id: "boq-1",
        itemDescription: "4K UHD Smart IP PTZ Camera with 30x Optical Zoom, Night Vision & IP67 Housing",
        unit: "Nos",
        qty: 50,
        benchmarkRate: 50000,
        quotedRate: 52000,
        gstPercent: 18,
        landedAmount: 3068000,
        variancePercent: 4.0,
        isAbnormallyLow: false,
      },
      {
        id: "boq-2",
        itemDescription: "64-Channel Enterprise Network Video Recorder (NVR) with RAID 6 Storage (128TB)",
        unit: "Nos",
        qty: 4,
        benchmarkRate: 320000,
        quotedRate: 330000,
        gstPercent: 18,
        landedAmount: 1557600,
        variancePercent: 3.1,
        isAbnormallyLow: false,
      },
      {
        id: "boq-3",
        itemDescription: "High-Grade Armoured Outdoor Cat-6 Ethernet Cable Spool (305 meters/drum)",
        unit: "Drums",
        qty: 25,
        benchmarkRate: 16000,
        quotedRate: 15800,
        gstPercent: 18,
        landedAmount: 466100,
        variancePercent: -1.2,
        isAbnormallyLow: false,
      },
      {
        id: "boq-4",
        itemDescription: "AI Surveillance Video Analytics Server Cluster (Face Detection, ANPR & Intrusion)",
        unit: "Sets",
        qty: 2,
        benchmarkRate: 750000,
        quotedRate: 760000,
        gstPercent: 18,
        landedAmount: 1793600,
        variancePercent: 1.3,
        isAbnormallyLow: false,
      },
      {
        id: "boq-5",
        itemDescription: "Installation, Commissioning, Civil Conduit Mounting & 3-Year Onsite Warranty Support",
        unit: "Lump Sum",
        qty: 1,
        benchmarkRate: 550000,
        quotedRate: 540000,
        gstPercent: 18,
        landedAmount: 637200,
        variancePercent: -1.8,
        isAbnormallyLow: false,
      },
    ],
  },
];

export async function GET() {
  return NextResponse.json({
    ceremony: ceremonyState,
    bids: ceremonyState.isDecrypted ? SAMPLE_DECRYPTED_BIDS : [],
    budget: 25000000,
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { action, officerIndex, pin } = body;

    // Reset Ceremony
    if (action === "RESET") {
      ceremonyState = {
        isDecrypted: false,
        tenderRef: "GEM/2025/B/6123456",
        officer1: {
          name: "Rajesh Kumar",
          designation: "Deputy Secretary & Tender Inviting Authority (MHA)",
          signed: false,
          dscSerial: "4A:9C:21:8F:77:E1:02:4B",
          timestamp: null,
        },
        officer2: {
          name: "Dr. Sunita Verma",
          designation: "Joint Director (Finance) & Member Secretary",
          signed: false,
          dscSerial: "7B:3E:99:11:4C:D0:A2:18",
          timestamp: null,
        },
        decryptedAt: null,
        decryptionHash: null,
      };

      return NextResponse.json({ success: true, ceremony: ceremonyState });
    }

    // Sign Key Share
    if (action === "SIGN_KEY_SHARE") {
      if (!pin || pin.length < 4) {
        return NextResponse.json({ error: "Valid 6-digit USB token PIN required." }, { status: 400 });
      }

      const now = new Date().toISOString();

      if (officerIndex === 1) {
        ceremonyState.officer1.signed = true;
        ceremonyState.officer1.timestamp = now;
      } else if (officerIndex === 2) {
        ceremonyState.officer2.signed = true;
        ceremonyState.officer2.timestamp = now;
      }

      // Check if both officers have signed
      if (ceremonyState.officer1.signed && ceremonyState.officer2.signed) {
        ceremonyState.isDecrypted = true;
        ceremonyState.decryptedAt = now;
        
        // Compute combined decryption SHA-256 seal
        const payload = `DECRYPT_PACKET_B|${ceremonyState.tenderRef}|${ceremonyState.officer1.dscSerial}|${ceremonyState.officer2.dscSerial}|${now}`;
        ceremonyState.decryptionHash = crypto.createHash("sha256").update(payload).digest("hex");

        await logAudit(
          user.id,
          "FINANCIAL_ENVELOPE_DUAL_KEY_DECRYPTED",
          "Tender",
          ceremonyState.tenderRef,
          {
            officer1: ceremonyState.officer1.name,
            officer2: ceremonyState.officer2.name,
            decryptionHash: ceremonyState.decryptionHash,
          }
        );
      } else {
        await logAudit(
          user.id,
          "FINANCIAL_KEY_SHARE_AUTHORIZED",
          "Tender",
          ceremonyState.tenderRef,
          { officerIndex, signedBy: officerIndex === 1 ? ceremonyState.officer1.name : ceremonyState.officer2.name }
        );
      }

      return NextResponse.json({
        success: true,
        ceremony: ceremonyState,
        bids: ceremonyState.isDecrypted ? SAMPLE_DECRYPTED_BIDS : [],
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Financial opening error" }, { status: 500 });
  }
}
