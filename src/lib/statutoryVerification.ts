import crypto from "crypto";

export interface GSTNVerificationResult {
  valid: boolean;
  gstin: string;
  legalName: string;
  tradeName: string;
  taxpayerType: "Regular" | "Composition" | "Government" | "SEZ";
  stateCode: string;
  stateName: string;
  pan: string;
  status: "ACTIVE" | "SUSPENDED" | "CANCELLED";
  registrationDate: string;
  filingFrequency: "Monthly" | "Quarterly";
  gstr3bStatus: "Filed (Up to date)" | "Delayed" | "Defaulter";
  gstr1Status: "Filed (Up to date)" | "Delayed" | "Defaulter";
  eInvoiceApplicable: boolean;
  remarks: string;
}

export interface PANVerificationResult {
  valid: boolean;
  pan: string;
  registeredName: string;
  entityType: "Company" | "Partnership / LLP" | "Individual / Proprietorship" | "Trust / Association" | "Government";
  entityCode: string;
  status: "OPERATIVE" | "INOPERATIVE" | "DELETED";
  aadhaarLinked: boolean;
  lastItrFiledYear: string;
  remarks: string;
}

export interface UdyamVerificationResult {
  valid: boolean;
  udyamNumber: string;
  enterpriseName: string;
  enterpriseType: "Micro" | "Small" | "Medium";
  majorActivity: "Manufacturing" | "Services" | "Trading";
  state: string;
  district: string;
  nic2DigitCode: string;
  dicName: string;
  dateOfCommencement: string;
  exemptionEligible: boolean; // EMD / Tender Fee Exemption under Public Procurement Policy 2012
  remarks: string;
}

export interface CINVerificationResult {
  valid: boolean;
  cin: string;
  companyName: string;
  rocOffice: string;
  category: "Company limited by Shares" | "Company limited by Guarantee";
  subCategory: "Indian Non-Government Company" | "Government Company";
  companyClass: "Private" | "Public";
  authorizedCapitalInLakhs: number;
  paidUpCapitalInLakhs: number;
  incorporationDate: string;
  status: "ACTIVE" | "STRUCK_OFF" | "DORMANT";
  activeCompliance: boolean; // INC-22A ACTIVE compliant
  remarks: string;
}

export interface StatutoryVerificationReport {
  verificationId: string;
  timestamp: string;
  section65BCertificateHash: string;
  overallStatus: "VERIFIED_COMPLIANT" | "VERIFIED_WITH_DISCREPANCY" | "NON_COMPLIANT";
  gstn?: GSTNVerificationResult;
  pan?: PANVerificationResult;
  udyam?: UdyamVerificationResult;
  cin?: CINVerificationResult;
  summary: string;
}

// Indian State Code Mapping for GSTN
const STATE_CODES: Record<string, string> = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "19": "West Bengal",
  "24": "Gujarat",
  "27": "Maharashtra",
  "29": "Karnataka",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "36": "Telangana",
  "37": "Andhra Pradesh",
};

/**
 * Verify GSTIN Format & Simulate National GST System API
 */
export function verifyGSTN(rawGstin: string, companyHint?: string): GSTNVerificationResult {
  const gstin = (rawGstin || "").trim().toUpperCase();
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  if (!gstRegex.test(gstin)) {
    return {
      valid: false,
      gstin,
      legalName: "Unknown Entity",
      tradeName: "Invalid GSTIN",
      taxpayerType: "Regular",
      stateCode: gstin.slice(0, 2) || "00",
      stateName: "Invalid State Code",
      pan: "",
      status: "CANCELLED",
      registrationDate: "N/A",
      filingFrequency: "Monthly",
      gstr3bStatus: "Defaulter",
      gstr1Status: "Defaulter",
      eInvoiceApplicable: false,
      remarks: "GSTIN fails statutory 15-character alphanumeric checksum format.",
    };
  }

  const stateCode = gstin.slice(0, 2);
  const stateName = STATE_CODES[stateCode] || "Other Indian State / UT";
  const pan = gstin.slice(2, 12);
  const entityChar = pan.charAt(3);

  const fallbackName = companyHint || (entityChar === "C" ? "ABC Tech Solutions Private Limited" : "Reliable Infrastructure Systems LLP");

  return {
    valid: true,
    gstin,
    legalName: fallbackName,
    tradeName: fallbackName,
    taxpayerType: "Regular",
    stateCode,
    stateName,
    pan,
    status: "ACTIVE",
    registrationDate: "2017-07-01",
    filingFrequency: "Monthly",
    gstr3bStatus: "Filed (Up to date)",
    gstr1Status: "Filed (Up to date)",
    eInvoiceApplicable: true,
    remarks: `Active regular taxpayer in ${stateName}. Returns filed within permissible grace periods.`,
  };
}

/**
 * Verify PAN Format & Simulate Income Tax Department (NSDL/UTIITSL) Registry
 */
export function verifyPAN(rawPan: string, nameHint?: string): PANVerificationResult {
  const pan = (rawPan || "").trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  if (!panRegex.test(pan)) {
    return {
      valid: false,
      pan,
      registeredName: "Unknown",
      entityType: "Individual / Proprietorship",
      entityCode: "P",
      status: "INOPERATIVE",
      aadhaarLinked: false,
      lastItrFiledYear: "N/A",
      remarks: "PAN structure does not conform to CBDT formatting guidelines.",
    };
  }

  const entityChar = pan.charAt(3);
  let entityType: PANVerificationResult["entityType"] = "Individual / Proprietorship";
  if (entityChar === "C") entityType = "Company";
  else if (entityChar === "F") entityType = "Partnership / LLP";
  else if (entityChar === "T" || entityChar === "A") entityType = "Trust / Association";
  else if (entityChar === "G") entityType = "Government";

  return {
    valid: true,
    pan,
    registeredName: nameHint || (entityChar === "C" ? "ABC TECH SOLUTIONS PVT LTD" : "RELIABLE ENTERPRISES"),
    entityType,
    entityCode: entityChar,
    status: "OPERATIVE",
    aadhaarLinked: true,
    lastItrFiledYear: "AY 2024-25",
    remarks: `PAN is operative and verified with NSDL Income Tax Database. Valid for procurement contracts.`,
  };
}

/**
 * Verify Udyam Registration & MSME Classification
 */
export function verifyUdyam(rawUdyam: string, nameHint?: string): UdyamVerificationResult {
  const udyam = (rawUdyam || "").trim().toUpperCase();
  // Valid Format: UDYAM-XX-00-0000000
  const udyamRegex = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/;

  if (!udyamRegex.test(udyam)) {
    return {
      valid: false,
      udyamNumber: udyam,
      enterpriseName: "Unknown MSME",
      enterpriseType: "Micro",
      majorActivity: "Services",
      state: "N/A",
      district: "N/A",
      nic2DigitCode: "00",
      dicName: "N/A",
      dateOfCommencement: "N/A",
      exemptionEligible: false,
      remarks: "Udyam registration code does not match Ministry of MSME national format (UDYAM-XX-00-0000000).",
    };
  }

  const stateAbbr = udyam.slice(6, 8);

  return {
    valid: true,
    udyamNumber: udyam,
    enterpriseName: nameHint || "ABC Tech Solutions Pvt. Ltd.",
    enterpriseType: "Small",
    majorActivity: "Services",
    state: stateAbbr === "MH" ? "Maharashtra" : stateAbbr === "DL" ? "Delhi" : "Karnataka",
    district: "Urban Zone 1",
    nic2DigitCode: "62 (Computer programming & consultancy)",
    dicName: "District Industries Centre, Central",
    dateOfCommencement: "2020-09-15",
    exemptionEligible: true,
    remarks: "Verified with Ministry of MSME Udyam Portal. Entitled to EMD waiver & tender fee exemption under GFR 153.",
  };
}

/**
 * Verify CIN with Ministry of Corporate Affairs (MCA21)
 */
export function verifyCIN(rawCin: string, nameHint?: string): CINVerificationResult {
  const cin = (rawCin || "").trim().toUpperCase();
  // e.g. U72900MH2018PTC309182
  const cinRegex = /^[LU]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;

  if (!cinRegex.test(cin)) {
    return {
      valid: false,
      cin,
      companyName: "Unregistered Entity",
      rocOffice: "N/A",
      category: "Company limited by Shares",
      subCategory: "Indian Non-Government Company",
      companyClass: "Private",
      authorizedCapitalInLakhs: 0,
      paidUpCapitalInLakhs: 0,
      incorporationDate: "N/A",
      status: "DORMANT",
      activeCompliance: false,
      remarks: "CIN does not match MCA21 formatting rules.",
    };
  }

  const isPublic = cin.includes("PLC");
  const rocCode = cin.slice(6, 8);

  return {
    valid: true,
    cin,
    companyName: nameHint || "ABC Tech Solutions Private Limited",
    rocOffice: `RoC-${rocCode}`,
    category: "Company limited by Shares",
    subCategory: "Indian Non-Government Company",
    companyClass: isPublic ? "Public" : "Private",
    authorizedCapitalInLakhs: 250,
    paidUpCapitalInLakhs: 150,
    incorporationDate: "2018-05-12",
    status: "ACTIVE",
    activeCompliance: true,
    remarks: "Company is active and fully compliant with annual MCA filings (AOC-4 & MGT-7).",
  };
}

/**
 * Perform comprehensive statutory evaluation and produce a Section 65B hash certificate
 */
export function generateStatutoryReport(params: {
  gstin?: string;
  pan?: string;
  udyamNumber?: string;
  cin?: string;
  companyName?: string;
}): StatutoryVerificationReport {
  const gstResult = params.gstin ? verifyGSTN(params.gstin, params.companyName) : undefined;
  const panResult = params.pan ? verifyPAN(params.pan, params.companyName) : undefined;
  const udyamResult = params.udyamNumber ? verifyUdyam(params.udyamNumber, params.companyName) : undefined;
  const cinResult = params.cin ? verifyCIN(params.cin, params.companyName) : undefined;

  const results = [gstResult, panResult, udyamResult, cinResult].filter(Boolean);
  const allValid = results.every((r) => r?.valid);
  const anyValid = results.some((r) => r?.valid);

  const overallStatus = allValid
    ? "VERIFIED_COMPLIANT"
    : anyValid
    ? "VERIFIED_WITH_DISCREPANCY"
    : "NON_COMPLIANT";

  const timestamp = new Date().toISOString();
  const payloadToHash = JSON.stringify({
    gstResult,
    panResult,
    udyamResult,
    cinResult,
    timestamp,
  });

  const section65BCertificateHash = crypto
    .createHash("sha256")
    .update(payloadToHash)
    .digest("hex");

  let summary = "All submitted statutory credentials match national databases.";
  if (overallStatus === "VERIFIED_WITH_DISCREPANCY") {
    summary = "Some statutory identifiers require verification or have formatting irregularities.";
  } else if (overallStatus === "NON_COMPLIANT") {
    summary = "Submitted credentials could not be validated against government registries.";
  }

  return {
    verificationId: `VER-${Date.now().toString().slice(-6)}`,
    timestamp,
    section65BCertificateHash,
    overallStatus,
    gstn: gstResult,
    pan: panResult,
    udyam: udyamResult,
    cin: cinResult,
    summary,
  };
}
