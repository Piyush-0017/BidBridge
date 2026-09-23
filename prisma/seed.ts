import { PrismaClient, Role, TenderStatus, BidStatus, VerificationStatus, RiskLevel, DecisionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SIH26100 database...");

  // Clean
  await prisma.notification.deleteMany();
  await prisma.officerDecision.deleteMany();
  await prisma.aIRecommendation.deleteMany();
  await prisma.riskResult.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.complianceResult.deleteMany();
  await prisma.verificationResult.deleteMany();
  await prisma.document.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.corrigendum.deleteMany();
  await prisma.tenderDocument.deleteMany();
  await prisma.tenderRequirement.deleteMany();
  await prisma.tender.deleteMany();
  await prisma.officerProfile.deleteMany();
  await prisma.bidderProfile.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password@123", 12);

  // Users
  const officer = await prisma.user.create({
    data: {
      email: "officer@sih.gov.in",
      name: "Rajesh Kumar",
      passwordHash,
      role: Role.OFFICER,
      officerProfile: {
        create: {
          department: "Ministry of Electronics & IT",
          designation: "Deputy Director (Procurement)",
        },
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@sih.gov.in",
      name: "System Admin",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const bidder1 = await prisma.user.create({
    data: {
      email: "bidder1@abctech.com",
      name: "Priya Sharma",
      passwordHash,
      role: Role.BIDDER,
      bidderProfile: {
        create: {
          companyName: "ABC Tech Solutions Pvt Ltd",
          gstin: "27AABCU9603R1ZM",
          pan: "AABCU9603R",
          udyamNumber: "UDYAM-MH-12-0012345",
          address: "Pune, Maharashtra",
        },
      },
    },
    include: { bidderProfile: true },
  });

  const bidder2 = await prisma.user.create({
    data: {
      email: "bidder2@secureit.in",
      name: "Amit Patel",
      passwordHash,
      role: Role.BIDDER,
      bidderProfile: {
        create: {
          companyName: "SecureIT Systems Ltd",
          gstin: "24AADCS1234A1Z5",
          pan: "AADCS1234A",
          udyamNumber: "UDYAM-GJ-01-0098765",
          address: "Ahmedabad, Gujarat",
        },
      },
    },
  });

  // Tenders
  const tender1 = await prisma.tender.create({
    data: {
      referenceNo: "GEM-2026-CCTV-001",
      title: "Supply & Installation of CCTV Surveillance System",
      department: "Ministry of Home Affairs",
      category: "Security Equipment",
      description: "Procurement of IP cameras, NVR, storage and installation services for 50 locations.",
      estimatedValue: 45000000,
      bidEndAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: TenderStatus.OPEN,
      source: "PORTAL",
      requirements: {
        create: [
          { code: "GST_VALID", description: "Valid GST registration", category: "Statutory", mandatory: true, weight: 15 },
          { code: "PAN_VALID", description: "Valid PAN of company", category: "Statutory", mandatory: true, weight: 10 },
          { code: "UDYAM", description: "Udyam / MSME registration if claimed", category: "Statutory", mandatory: false, weight: 5 },
          { code: "TECH_SPEC", description: "Compliance with technical specifications", category: "Technical", mandatory: true, weight: 30 },
          { code: "EXP_3YR", description: "Minimum 3 years experience in similar work", category: "Experience", mandatory: true, weight: 20 },
          { code: "FIN_TURN", description: "Average annual turnover > 5 Cr last 3 years", category: "Financial", mandatory: true, weight: 20 },
        ],
      },
    },
    include: { requirements: true },
  });

  const tender2 = await prisma.tender.create({
    data: {
      referenceNo: "MEITY-2026-CLOUD-002",
      title: "Cloud Hosting & Managed Services for e-Governance Applications",
      department: "Ministry of Electronics & IT",
      category: "IT Services",
      description: "Managed cloud infrastructure, security monitoring and 24x7 support.",
      estimatedValue: 120000000,
      bidEndAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: TenderStatus.PUBLISHED,
      source: "PORTAL",
      requirements: {
        create: [
          { code: "GST_VALID", description: "Valid GST registration", category: "Statutory", mandatory: true, weight: 10 },
          { code: "ISO_27001", description: "ISO 27001 certification", category: "Technical", mandatory: true, weight: 25 },
          { code: "MEITY_EMPANEL", description: "MeitY empaneled cloud service provider", category: "Technical", mandatory: true, weight: 30 },
          { code: "FIN_TURN", description: "Turnover > 20 Cr", category: "Financial", mandatory: true, weight: 20 },
          { code: "EXP_5YR", description: "5+ years cloud services experience", category: "Experience", mandatory: true, weight: 15 },
        ],
      },
    },
  });

  const tender3 = await prisma.tender.create({
    data: {
      referenceNo: "DRAFT-2026-NETWORK-003",
      title: "Network Equipment Upgrade - Phase 1",
      department: "Department of Telecommunications",
      category: "Networking",
      description: "Switches, routers and firewalls for regional offices.",
      estimatedValue: 18000000,
      bidEndAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      status: TenderStatus.DRAFT,
      source: "PORTAL",
    },
  });

  // Bid from bidder1 on tender1
  const reqs = tender1.requirements;
  const bid1 = await prisma.bid.create({
    data: {
      tenderId: tender1.id,
      bidderId: bidder1.id,
      status: BidStatus.SUBMITTED,
      complianceScore: 82,
      riskLevel: RiskLevel.LOW,
      submittedAt: new Date(),
      compliance: {
        create: reqs.map((r, i) => ({
          requirementId: r.id,
          status: i < 4 ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
          score: i < 4 ? Number(r.weight) : 0,
          reason: i < 4 ? "Verified via mock adapter" : "Awaiting document",
          evidenceText: i < 4 ? `Mock evidence for ${r.code}` : null,
        })),
      },
      recommendation: {
        create: {
          action: DecisionType.QUALIFY,
          confidence: 0.87,
          explanation: "Strong compliance on statutory and technical criteria. Minor pending financial docs.",
        },
      },
      riskResult: {
        create: {
          score: 18,
          level: RiskLevel.LOW,
          factors: { missingDocs: 1, inconsistencies: 0, pastPerformance: "good" },
        },
      },
    },
  });

  // Second bid
  await prisma.bid.create({
    data: {
      tenderId: tender1.id,
      bidderId: bidder2.id,
      status: BidStatus.UNDER_EVALUATION,
      complianceScore: 65,
      riskLevel: RiskLevel.MEDIUM,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Audit logs
  await prisma.auditLog.createMany({
    data: [
      { actorId: officer.id, action: "LOGIN", entityType: "User", entityId: officer.id },
      { actorId: bidder1.id, action: "BID_SUBMIT", entityType: "Bid", entityId: bid1.id, details: { tender: tender1.referenceNo } },
      { actorId: officer.id, action: "VIEW_COMPLIANCE", entityType: "Bid", entityId: bid1.id },
      { actorId: null, action: "SYSTEM_SEED", entityType: "System", details: { note: "Initial seed completed" } },
    ],
  });

  console.log("Seed completed successfully.");
  console.log("Demo accounts (password: Password@123):");
  console.log("  Officer : officer@sih.gov.in");
  console.log("  Bidder  : bidder1@abctech.com");
  console.log("  Admin   : admin@sih.gov.in");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
