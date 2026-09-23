import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dataStore } from "@/lib/dataStore";

export async function GET() {
  let dbStatus = "connected";
  let isDbOk = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    isDbOk = false;
    dbStatus = "down";
  }

  const isDemo = process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const overallStatus = isDbOk ? "healthy" : isDemo ? "degraded" : "down";
  const httpStatusCode = isDbOk || isDemo ? 200 : 503;

  return NextResponse.json(
    {
      status: overallStatus,
      service: "Central e-Procurement Portal (BidBridge)",
      environment: process.env.NODE_ENV || "development",
      demoMode: isDemo,
      timestamp: new Date().toISOString(),
      components: {
        database: {
          status: dbStatus,
          provider: "PostgreSQL (Neon Cloud Serverless)",
        },
        documentStorage: {
          status: "healthy",
          vault: "AES-256 Multi-Cloud & Local Vault",
        },
        governmentIntegrations: {
          status: "active",
          mode: process.env.GOVERNMENT_INTEGRATION_MODE || "SIMULATED_SOURCE",
          transparencyLabel: "DEMO VERIFIED — SIMULATED SOURCE",
        },
      },
      stats: {
        tendersCount: dataStore.getTenders().length,
        bidsCount: dataStore.getBids().length,
      },
    },
    { status: httpStatusCode }
  );
}
