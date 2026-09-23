import fs from "fs";
import path from "path";

export interface DataStoreUser {
  id: string;
  email: string;
  name: string;
  role: "BIDDER" | "OFFICER" | "ADMIN";
  bidderProfile?: {
    companyName: string;
    gstin: string;
    pan: string;
    udyamNumber?: string;
  };
  officerProfile?: {
    department: string;
    designation: string;
  };
}

export interface DataStoreTender {
  id: string;
  referenceNo: string;
  title: string;
  department: string;
  category: string;
  description?: string;
  estimatedValue?: number;
  bidEndAt: string;
  status: "DRAFT" | "PUBLISHED" | "OPEN" | "CLOSED" | "AWARDED";
  source?: string;
  createdAt: string;
  requirements?: Array<{
    id: string;
    code: string;
    description: string;
    category: string;
    mandatory: boolean;
    weight?: number;
  }>;
  _count?: { bids: number };
}

export interface DataStoreBid {
  id: string;
  tenderId: string;
  bidderId: string;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_EVALUATION"
    | "TECHNICALLY_QUALIFIED"
    | "TECHNICALLY_DISQUALIFIED"
    | "FINANCIAL_EVALUATION"
    | "AWARDED"
    | "NOT_AWARDED";
  complianceScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  technicalScore?: number;
  financialScore?: number;
  evaluatedValue?: number;
  submittedAt?: string;
  receiptNo?: string;
  hash?: string;
  createdAt: string;
  updatedAt: string;
  tender?: {
    id: string;
    referenceNo: string;
    title: string;
    department?: string;
    status?: string;
    estimatedValue?: number;
    bidEndAt?: string;
  };
  bidder?: {
    id: string;
    name: string;
    email: string;
    bidderProfile?: {
      companyName: string;
      gstin?: string;
      pan?: string;
    };
  };
  recommendation?: {
    action: "QUALIFY" | "DISQUALIFY" | "REQUEST_CLARIFICATION";
    confidence: number;
    explanation: string;
  };
  decision?: {
    id: string;
    officerId: string;
    decision: "QUALIFY" | "DISQUALIFY" | "REQUEST_CLARIFICATION";
    reason: string;
    createdAt: string;
  };
}

export interface DataStoreDecision {
  id: string;
  bidId: string;
  officerId: string;
  decision: "QUALIFY" | "DISQUALIFY" | "REQUEST_CLARIFICATION";
  reason: string;
  createdAt: string;
  bid?: any;
  officer?: {
    name: string;
    email: string;
  };
}

export interface DataStoreAuditLog {
  id: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DataStoreNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface DBState {
  users: DataStoreUser[];
  tenders: DataStoreTender[];
  bids: DataStoreBid[];
  decisions: DataStoreDecision[];
  auditLogs: DataStoreAuditLog[];
  notifications: DataStoreNotification[];
}

const DB_FILE = path.join(process.cwd(), "src", "data", "db.json");

function getInitialData(): DBState {
  const users: DataStoreUser[] = [
    {
      id: "bidder-1",
      email: "procurement@abctech.in",
      name: "ABC Tech Solutions Private Limited",
      role: "BIDDER",
      bidderProfile: {
        companyName: "ABC Tech Solutions Private Limited",
        gstin: "27ABCDE1234F1Z5",
        pan: "ABCDE1234F",
        udyamNumber: "UDYAM-MH-01-0087654",
      },
    },
    {
      id: "officer-1",
      email: "rajesh.kumar@mha.gov.in",
      name: "Rajesh Kumar",
      role: "OFFICER",
      officerProfile: {
        department: "Ministry of Home Affairs",
        designation: "Deputy Secretary (Procurement)",
      },
    },
  ];

  const tenders: DataStoreTender[] = [
    {
      id: "tender-1",
      referenceNo: "GEM/2025/B/6123456",
      title: "Supply, Installation and Commissioning of Smart IP CCTV Cameras & Command Center",
      department: "Ministry of Home Affairs • Central Armed Police Forces",
      category: "Surveillance & Electronic Security",
      description:
        "Comprehensive turnkey installation of 4K IP cameras, enterprise NVR servers, video analytics, and unified control room integration.",
      estimatedValue: 20558000,
      bidEndAt: "2026-09-28T18:00:00.000Z",
      status: "OPEN",
      source: "GeM",
      createdAt: "2026-08-01T10:00:00.000Z",
      requirements: [
        { id: "req-1", code: "TECH-01", description: "4K UHD Smart IP PTZ Camera with 30x Optical Zoom", category: "Technical", mandatory: true, weight: 30 },
        { id: "req-2", code: "TECH-02", description: "64-Channel Enterprise NVR RAID 6 (128TB Storage)", category: "Technical", mandatory: true, weight: 30 },
        { id: "req-3", code: "MII-01", description: "Make In India Local Content >= 50% Certification", category: "Statutory", mandatory: true, weight: 20 },
        { id: "req-4", code: "DOC-01", description: "Valid GST Registration Certificate & PAN Card", category: "Statutory", mandatory: true, weight: 20 },
      ],
      _count: { bids: 1 },
    },
    {
      id: "tender-2",
      referenceNo: "GEM/2025/B/6124100",
      title: "Cloud Hosting, Disaster Recovery & High-Availability Database Cluster Services",
      department: "National Informatics Centre (NIC) • MeitY",
      category: "Cloud & Data Center Infrastructure",
      description: "Tier-IV MeitY empaneled cloud infrastructure with RPO < 15 mins and RTO < 1 hour for mission-critical central services.",
      estimatedValue: 38500000,
      bidEndAt: "2026-10-15T15:00:00.000Z",
      status: "OPEN",
      source: "GeM",
      createdAt: "2026-08-05T12:00:00.000Z",
      _count: { bids: 1 },
    },
    {
      id: "tender-3",
      referenceNo: "NIT/RAIL/2025/CCTV-AMC",
      title: "Comprehensive Annual Maintenance Contract (CAMC) for Surveillance & Video Analytics",
      department: "Ministry of Railways • Northern Railway Zone",
      category: "Annual Maintenance & Support Services",
      description: "24x7 corrective and preventive maintenance across 42 railway divisions with 99.8% SLA.",
      estimatedValue: 4800000,
      bidEndAt: "2026-09-22T17:00:00.000Z",
      status: "OPEN",
      source: "CPPP",
      createdAt: "2026-07-20T09:00:00.000Z",
      _count: { bids: 1 },
    },
    {
      id: "tender-4",
      referenceNo: "GEM/2025/B/9018241",
      title: "Procurement of Enterprise Hyperconverged Infrastructure (HCI) Nodes",
      department: "Defence Research and Development Organisation (DRDO)",
      category: "IT Hardware & High Performance Computing",
      description: "Supply of 12 node HCI cluster with NVMe storage and dual 100GbE RDMA network fabrics.",
      estimatedValue: 54000000,
      bidEndAt: "2026-10-05T14:30:00.000Z",
      status: "OPEN",
      source: "GeM",
      createdAt: "2026-08-10T14:00:00.000Z",
      _count: { bids: 0 },
    },
    {
      id: "tender-5",
      referenceNo: "GEM/2025/B/8712033",
      title: "Supply and Commissioning of Secure Dual-Band VHF/UHF Tactical Radios",
      department: "Border Security Force (BSF) Headquarters",
      category: "Telecommunications & Defense Electronics",
      description: "Mil-spec encrypted frequency-hopping portable transceivers for tactical ground operations.",
      estimatedValue: 12500000,
      bidEndAt: "2026-09-30T17:00:00.000Z",
      status: "OPEN",
      source: "GeM",
      createdAt: "2026-08-12T11:00:00.000Z",
      _count: { bids: 0 },
    },
    {
      id: "tender-6",
      referenceNo: "NIT/MORTH/2025/FASTAG-09",
      title: "Automated Number Plate Recognition (ANPR) Cameras & Barrier Controllers",
      department: "National Highways Authority of India (NHAI)",
      category: "Highway Tolling & Intelligent Transportation",
      description: "Supply of high-speed ANPR optical cameras and optical loop controllers for multi-lane free-flow toll plazas.",
      estimatedValue: 17200000,
      bidEndAt: "2026-10-12T16:00:00.000Z",
      status: "PUBLISHED",
      source: "CPPP",
      createdAt: "2026-08-15T09:30:00.000Z",
      _count: { bids: 0 },
    },
  ];

  const bids: DataStoreBid[] = [
    {
      id: "bid-1",
      tenderId: "tender-1",
      bidderId: "bidder-1",
      status: "SUBMITTED",
      complianceScore: 98,
      riskLevel: "LOW",
      technicalScore: 95,
      financialScore: 92,
      evaluatedValue: 20558000,
      submittedAt: "2026-08-16T14:30:00.000Z",
      receiptNo: "ACK-CPPP-2025-884129",
      hash: "e8a719c2f5d3410b91e784501a3cd4b76e89021a8f9b4c3e2d1056789abcdef0",
      createdAt: "2026-08-16T14:30:00.000Z",
      updatedAt: "2026-08-16T14:30:00.000Z",
      tender: {
        id: "tender-1",
        referenceNo: "GEM/2025/B/6123456",
        title: "Supply, Installation and Commissioning of Smart IP CCTV Cameras & Command Center",
        department: "Ministry of Home Affairs • Central Armed Police Forces",
        status: "OPEN",
        estimatedValue: 20558000,
        bidEndAt: "2026-09-28T18:00:00.000Z",
      },
      bidder: {
        id: "bidder-1",
        name: "ABC Tech Solutions Private Limited",
        email: "procurement@abctech.in",
        bidderProfile: {
          companyName: "ABC Tech Solutions Private Limited",
          gstin: "27ABCDE1234F1Z5",
          pan: "ABCDE1234F",
        },
      },
      recommendation: {
        action: "QUALIFY",
        confidence: 98,
        explanation: "All technical clauses complied. GSTN/PAN validated. Class-I MII declared at 68%.",
      },
    },
    {
      id: "bid-2",
      tenderId: "tender-2",
      bidderId: "bidder-1",
      status: "UNDER_EVALUATION",
      complianceScore: 94,
      riskLevel: "LOW",
      technicalScore: 91,
      financialScore: 90,
      evaluatedValue: 38500000,
      submittedAt: "2026-08-04T11:20:00.000Z",
      receiptNo: "ACK-CPPP-2025-771203",
      createdAt: "2026-08-04T11:20:00.000Z",
      updatedAt: "2026-08-04T11:20:00.000Z",
      tender: {
        id: "tender-2",
        referenceNo: "GEM/2025/B/6124100",
        title: "Cloud Hosting, Disaster Recovery & High-Availability Database Cluster Services",
        department: "National Informatics Centre (NIC) • MeitY",
        status: "OPEN",
        estimatedValue: 38500000,
      },
      bidder: {
        id: "bidder-1",
        name: "ABC Tech Solutions Private Limited",
        email: "procurement@abctech.in",
        bidderProfile: {
          companyName: "ABC Tech Solutions Private Limited",
          gstin: "27ABCDE1234F1Z5",
          pan: "ABCDE1234F",
        },
      },
      recommendation: {
        action: "QUALIFY",
        confidence: 94,
        explanation: "MeitY audit certificate valid. Tier-IV specifications verified.",
      },
    },
    {
      id: "bid-3",
      tenderId: "tender-3",
      bidderId: "bidder-1",
      status: "TECHNICALLY_QUALIFIED",
      complianceScore: 96,
      riskLevel: "LOW",
      technicalScore: 96,
      financialScore: 94,
      evaluatedValue: 4800000,
      submittedAt: "2026-07-28T16:45:00.000Z",
      receiptNo: "ACK-CPPP-2025-662914",
      createdAt: "2026-07-28T16:45:00.000Z",
      updatedAt: "2026-08-02T10:15:00.000Z",
      tender: {
        id: "tender-3",
        referenceNo: "NIT/RAIL/2025/CCTV-AMC",
        title: "Comprehensive Annual Maintenance Contract (CAMC) for Surveillance & Video Analytics",
        department: "Ministry of Railways • Northern Railway Zone",
        status: "OPEN",
        estimatedValue: 4800000,
      },
      bidder: {
        id: "bidder-1",
        name: "ABC Tech Solutions Private Limited",
        email: "procurement@abctech.in",
        bidderProfile: {
          companyName: "ABC Tech Solutions Private Limited",
          gstin: "27ABCDE1234F1Z5",
          pan: "ABCDE1234F",
        },
      },
      decision: {
        id: "dec-1",
        officerId: "officer-1",
        decision: "QUALIFY",
        reason: "Full compliance with CAMC SLA schedules and past performance in Northern Railway divisions verified.",
        createdAt: "2026-08-02T10:15:00.000Z",
      },
    },
  ];

  const decisions: DataStoreDecision[] = [
    {
      id: "dec-1",
      bidId: "bid-3",
      officerId: "officer-1",
      decision: "QUALIFY",
      reason: "Full compliance with CAMC SLA schedules and past performance in Northern Railway divisions verified.",
      createdAt: "2026-08-02T10:15:00.000Z",
      bid: {
        tender: { referenceNo: "NIT/RAIL/2025/CCTV-AMC" },
        bidder: { bidderProfile: { companyName: "ABC Tech Solutions Private Limited" } },
      },
      officer: {
        name: "Rajesh Kumar",
        email: "rajesh.kumar@mha.gov.in",
      },
    },
  ];

  const auditLogs: DataStoreAuditLog[] = [
    {
      id: "log-1",
      actorId: "officer-1",
      action: "OFFICER_DECISION",
      entityType: "Bid",
      entityId: "bid-3",
      details: { decision: "QUALIFY", reason: "Technically qualified for Packet B opening." },
      createdAt: "2026-08-02T10:15:00.000Z",
      actor: { id: "officer-1", name: "Rajesh Kumar", email: "rajesh.kumar@mha.gov.in" },
    },
    {
      id: "log-2",
      actorId: "bidder-1",
      action: "BID_SUBMIT",
      entityType: "Bid",
      entityId: "bid-1",
      details: { tenderRef: "GEM/2025/B/6123456", ackNumber: "ACK-CPPP-2025-884129" },
      createdAt: "2026-08-16T14:30:00.000Z",
      actor: { id: "bidder-1", name: "ABC Tech Solutions Private Limited", email: "procurement@abctech.in" },
    },
    {
      id: "log-3",
      actorId: "officer-1",
      action: "TENDER_PUBLISH",
      entityType: "Tender",
      entityId: "tender-1",
      details: { referenceNo: "GEM/2025/B/6123456" },
      createdAt: "2026-08-01T10:00:00.000Z",
      actor: { id: "officer-1", name: "Rajesh Kumar", email: "rajesh.kumar@mha.gov.in" },
    },
  ];

  const notifications: DataStoreNotification[] = [
    {
      id: "notif-1",
      userId: "bidder-1",
      title: "Decision: QUALIFY",
      message: "Your bid for NIT/RAIL/2025/CCTV-AMC has been technically qualified by the procurement committee.",
      read: false,
      link: "/bidder/my-bids",
      createdAt: "2026-08-02T10:15:00.000Z",
    },
    {
      id: "notif-2",
      userId: "officer-1",
      title: "New Bid Received",
      message: "ABC Tech Solutions Private Limited submitted a proposal for GEM/2025/B/6123456.",
      read: false,
      link: "/officer/bids",
      createdAt: "2026-08-16T14:30:00.000Z",
    },
  ];

  return { users, tenders, bids, decisions, auditLogs, notifications };
}

class DataStore {
  private data: DBState;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DBState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("Failed to load db.json, using defaults:", err);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DBState) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save db.json:", err);
    }
  }

  public getTenders(filter?: { status?: string }) {
    let list = this.data.tenders;
    if (filter?.status) {
      list = list.filter((t) => t.status === filter.status);
    }
    return list;
  }

  public getTenderById(id: string) {
    return this.data.tenders.find((t) => t.id === id || t.referenceNo === id);
  }

  public createTender(tenderData: Partial<DataStoreTender>) {
    const id = `tender-${Date.now()}`;
    const newTender: DataStoreTender = {
      id,
      referenceNo: tenderData.referenceNo || `GEM/2026/B/${Date.now().toString().slice(-7)}`,
      title: tenderData.title || "Government e-Procurement Tender",
      department: tenderData.department || "Ministry of Home Affairs",
      category: tenderData.category || "General Supplies",
      description: tenderData.description,
      estimatedValue: tenderData.estimatedValue,
      bidEndAt: tenderData.bidEndAt || new Date(Date.now() + 15 * 86400000).toISOString(),
      status: tenderData.status || "OPEN",
      source: "PORTAL",
      createdAt: new Date().toISOString(),
      requirements: tenderData.requirements || [],
      _count: { bids: 0 },
    };
    this.data.tenders.unshift(newTender);
    this.saveData(this.data);
    return newTender;
  }

  public getBids(filter?: { tenderId?: string; bidderId?: string; my?: boolean }) {
    let list = this.data.bids;
    if (filter?.tenderId) {
      list = list.filter((b) => b.tenderId === filter.tenderId);
    }
    if (filter?.bidderId) {
      list = list.filter((b) => b.bidderId === filter.bidderId);
    }
    return list;
  }

  public getBidById(id: string) {
    return this.data.bids.find((b) => b.id === id);
  }

  public createOrUpdateBid(params: {
    tenderId: string;
    bidderId?: string;
    status?: DataStoreBid["status"];
    evaluatedValue?: number;
    totalAmount?: number;
    complianceScore?: number;
    receiptNo?: string;
    hash?: string;
    tenderRef?: string;
    tenderTitle?: string;
  }) {
    const bidderId = params.bidderId || "bidder-1";
    let bid = this.data.bids.find((b) => b.tenderId === params.tenderId && b.bidderId === bidderId);

    // Also look up tender
    let tender = this.data.tenders.find((t) => t.id === params.tenderId || t.referenceNo === params.tenderRef);
    if (!tender && params.tenderRef) {
      tender = {
        id: params.tenderId,
        referenceNo: params.tenderRef,
        title: params.tenderTitle || "Smart Surveillance & Electronic Security",
        department: "Ministry of Home Affairs",
        category: "Surveillance & Electronic Security",
        estimatedValue: params.totalAmount || params.evaluatedValue || 20558000,
        bidEndAt: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: "OPEN",
        createdAt: new Date().toISOString(),
      };
      this.data.tenders.push(tender);
    }

    const bidder = this.data.users.find((u) => u.id === bidderId) || this.data.users[0];
    const now = new Date().toISOString();
    const finalVal = params.totalAmount || params.evaluatedValue || 20558000;
    const finalReceipt = params.receiptNo || `ACK-CPPP-2026-${Date.now().toString(36).toUpperCase()}`;

    if (bid) {
      bid.status = params.status || "SUBMITTED";
      bid.evaluatedValue = finalVal;
      bid.complianceScore = params.complianceScore ?? bid.complianceScore ?? 98;
      bid.submittedAt = now;
      bid.updatedAt = now;
      if (params.receiptNo) bid.receiptNo = params.receiptNo;
      if (params.hash) bid.hash = params.hash;
    } else {
      const newBidId = `bid-${Date.now()}`;
      bid = {
        id: newBidId,
        tenderId: tender?.id || params.tenderId,
        bidderId,
        status: params.status || "SUBMITTED",
        complianceScore: params.complianceScore ?? 98,
        riskLevel: "LOW",
        technicalScore: 95,
        financialScore: 92,
        evaluatedValue: finalVal,
        submittedAt: now,
        receiptNo: finalReceipt,
        hash: params.hash || "e8a719c2f5d3410b91e784501a3cd4b76e89021a8f9b4c3e2d1056789abcdef0",
        createdAt: now,
        updatedAt: now,
        tender: {
          id: tender?.id || params.tenderId,
          referenceNo: tender?.referenceNo || params.tenderRef || "GEM/2025/B/6123456",
          title: tender?.title || "Central Government Procurement",
          department: tender?.department || "Central Ministry",
          status: tender?.status || "OPEN",
          estimatedValue: tender?.estimatedValue || finalVal,
        },
        bidder: {
          id: bidder.id,
          name: bidder.name,
          email: bidder.email,
          bidderProfile: bidder.bidderProfile,
        },
        recommendation: {
          action: "QUALIFY",
          confidence: 97,
          explanation: "All mandatory specs matched, GSTN and PAN active, compliant with Class-1 MII guidelines.",
        },
      };
      this.data.bids.unshift(bid);
      if (tender && tender._count) {
        tender._count.bids += 1;
      }
    }

    // Add audit log
    this.logAudit(bidderId, "BID_SUBMIT", "Bid", bid.id, {
      tenderRef: bid.tender?.referenceNo,
      receiptNo: bid.receiptNo,
      status: bid.status,
    });

    // Add notification for Officer
    this.createNotification({
      userId: "officer-1",
      title: "New Bid Submission Received",
      message: `${bidder.name} submitted a sealed proposal for ${bid.tender?.referenceNo} (₹ ${finalVal.toLocaleString("en-IN")}).`,
      link: "/officer/bids",
    });

    this.saveData(this.data);
    return bid;
  }

  public recordDecision(params: {
    bidId: string;
    officerId: string;
    decision: "QUALIFY" | "DISQUALIFY" | "REQUEST_CLARIFICATION";
    reason: string;
  }) {
    const bid = this.data.bids.find((b) => b.id === params.bidId);
    if (!bid) return null;

    let newStatus: DataStoreBid["status"] = bid.status;
    if (params.decision === "QUALIFY") newStatus = "TECHNICALLY_QUALIFIED";
    if (params.decision === "DISQUALIFY") newStatus = "TECHNICALLY_DISQUALIFIED";
    if (params.decision === "REQUEST_CLARIFICATION") newStatus = "UNDER_EVALUATION";

    bid.status = newStatus;
    bid.updatedAt = new Date().toISOString();

    const decisionId = `dec-${Date.now()}`;
    const officer = this.data.users.find((u) => u.id === params.officerId) || this.data.users[1];

    const decisionRecord: DataStoreDecision = {
      id: decisionId,
      bidId: params.bidId,
      officerId: params.officerId,
      decision: params.decision,
      reason: params.reason,
      createdAt: new Date().toISOString(),
      bid: {
        id: bid.id,
        tender: bid.tender,
        bidder: bid.bidder,
      },
      officer: {
        name: officer?.name || "Rajesh Kumar",
        email: officer?.email || "rajesh.kumar@mha.gov.in",
      },
    };

    bid.decision = {
      id: decisionId,
      officerId: params.officerId,
      decision: params.decision,
      reason: params.reason,
      createdAt: new Date().toISOString(),
    };

    // Upsert decision list
    const existingIdx = this.data.decisions.findIndex((d) => d.bidId === params.bidId);
    if (existingIdx >= 0) {
      this.data.decisions[existingIdx] = decisionRecord;
    } else {
      this.data.decisions.unshift(decisionRecord);
    }

    // Notify bidder
    this.createNotification({
      userId: bid.bidderId,
      title: `Officer Evaluation Decision: ${params.decision}`,
      message: `Your bid for ${bid.tender?.referenceNo} was marked ${params.decision}: "${params.reason}"`,
      link: "/bidder/my-bids",
    });

    // Audit log
    this.logAudit(params.officerId, "OFFICER_DECISION", "Bid", params.bidId, {
      decision: params.decision,
      reason: params.reason,
    });

    this.saveData(this.data);
    return decisionRecord;
  }

  public getDecisions() {
    return this.data.decisions;
  }

  public logAudit(
    actorId?: string | null,
    action: string = "ACTION",
    entityType: string = "Entity",
    entityId?: string,
    details?: any,
    ip?: string
  ) {
    const actor = this.data.users.find((u) => u.id === actorId);
    const newLog: DataStoreAuditLog = {
      id: `log-${Date.now()}-${this.data.auditLogs.length + 1}`,
      actorId: actorId || null,
      action,
      entityType,
      entityId,
      details,
      ipAddress: ip,
      createdAt: new Date().toISOString(),
      actor: actor ? { id: actor.id, name: actor.name, email: actor.email } : undefined,
    };
    this.data.auditLogs.unshift(newLog);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs.pop();
    }
    this.saveData(this.data);
    return newLog;
  }

  public getAuditLogs() {
    return this.data.auditLogs;
  }

  public createNotification(params: {
    userId: string;
    title: string;
    message: string;
    link?: string;
  }) {
    const newNotif: DataStoreNotification = {
      id: `notif-${Date.now()}-${this.data.notifications.length + 1}`,
      userId: params.userId,
      title: params.title,
      message: params.message,
      read: false,
      link: params.link,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(newNotif);
    this.saveData(this.data);
    return newNotif;
  }

  public getNotifications(userId?: string) {
    if (!userId) return this.data.notifications;
    return this.data.notifications.filter((n) => n.userId === userId);
  }
}

// Global singleton instance
const globalForDataStore = globalThis as unknown as { dataStore?: DataStore };

export const dataStore = globalForDataStore.dataStore ?? new DataStore();

if (process.env.NODE_ENV !== "production") {
  globalForDataStore.dataStore = dataStore;
}
