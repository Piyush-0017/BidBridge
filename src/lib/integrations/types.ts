export type GovernmentSourceType =
  | "GSTN"
  | "UDYAM"
  | "PAN_IT"
  | "MCA21"
  | "EPFO"
  | "ESIC"
  | "DIGILOCKER"
  | "BIS_DPIIT"
  | "BLACKLIST_DEBARMENT"
  | "GEM";

export type IntegrationMode = "SIMULATED_SOURCE" | "AUTHORIZED_API";

export interface CheckRequest {
  requirementCode: string;
  companyName: string;
  gstin?: string;
  pan?: string;
  udyam?: string;
  cin?: string;
  epfoCode?: string;
  tenderRef?: string;
  category?: string;
}

export interface CheckResult {
  status: "VERIFIED" | "FAILED" | "PENDING" | "NOT_AVAILABLE";
  source: string;
  reference?: string;
  evidence?: string;
  checkedAt: string;
}

export interface GovernmentVerificationRecord {
  source: GovernmentSourceType;
  mode: IntegrationMode;
  status: "VERIFIED" | "FAILED" | "SUSPENDED" | "EXPIRED" | "WARNING" | "NOT_AVAILABLE";
  transparencyLabel: "DEMO VERIFIED — SIMULATED SOURCE" | "OFFICIAL_AUTHORIZED_RESPONSE";
  referenceNumber: string;
  verifiedAt: string;
  extractedFields: Record<string, any>;
  evidenceSummary: string;
  confidence: number;
  failureReason?: string;
  recommendedOfficerAction?: string;
}

export interface CrossDocumentMatchResult {
  field: "PAN_GSTIN_LINK" | "LEGAL_NAME" | "REGISTERED_ADDRESS" | "AUTHORIZED_SIGNATORY" | "UDIN_CA";
  sourceA: { docType: string; value: string };
  sourceB: { docType: string; value: string };
  matchScore: number; // 0 to 100
  verdict: "EXACT_MATCH" | "ACCEPTABLE_VARIATION" | "MISMATCH_FLAG";
  explanation: string;
  officerActionRequired: boolean;
}

export interface RiskFactor {
  code: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  penaltyScore: number;
  evidenceRef: string;
  explanation: string;
  recommendedOfficerAction: string;
}

export interface EvidenceNode {
  id: string;
  requirementCode: string;
  clause: string;
  status: "COMPLIANT" | "NON_COMPLIANT" | "UNDER_REVIEW";
  extractedField: {
    name: string;
    value: string;
    confidence: number;
  };
  govSourceRecord?: GovernmentVerificationRecord;
  crossMatch?: CrossDocumentMatchResult;
}

export interface ComplianceEvaluationReport {
  bidderId: string;
  companyName: string;
  tenderRef: string;
  evaluatedAt: string;
  overallComplianceScore: number; // 0 to 100
  aiExtractionConfidence: number; // 0 to 100
  riskScore: number; // 0 to 100 (higher = riskier)
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  topRiskSummary: string;
  aiRecommendation: "RECOMMEND_QUALIFY" | "RECOMMEND_DISQUALIFY" | "SEEK_STATUTORY_CLARIFICATION";
  governanceDisclaimer: "AI Decision Support — Final qualification/disqualification rests strictly with the Procurement Officer under GFR 2017";
  debarmentStatus: {
    status: "CLEAR" | "POSSIBLE_MATCH" | "DEBARRED";
    cpppCleared: boolean;
    gemCleared: boolean;
    ministryCleared: boolean;
    lastChecked: string;
    matchedEntity?: string;
    similarityPercent?: number;
    recommendedAction: string;
  };
  crossDocumentMatches: CrossDocumentMatchResult[];
  riskFactors: RiskFactor[];
  evidenceGraph: EvidenceNode[];
  governmentVerifications: GovernmentVerificationRecord[];
}

export interface GovernmentAdapter {
  sourceType: GovernmentSourceType;
  name: string;
  verify(req: CheckRequest): Promise<GovernmentVerificationRecord>;
  check?(req: CheckRequest): Promise<CheckResult>;
}

export function getTransparencyMetadata(mode: IntegrationMode) {
  if (mode === "AUTHORIZED_API") {
    return {
      label: "OFFICIAL_AUTHORIZED_RESPONSE",
      displayName: "Official Authorized Response",
      badgeColor: "emerald",
      disclaimer: "Verified directly against statutory government gateway via authorized credentials.",
      isProductionGrade: true,
    };
  }
  return {
    label: "DEMO VERIFIED — SIMULATED SOURCE",
    displayName: "Simulated Source (Structural Check)",
    badgeColor: "amber",
    disclaimer: "Deterministic structural regex validation. Sandbox mode for demonstration.",
    isProductionGrade: false,
  };
}

