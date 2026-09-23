export function generateComparativeStatement(
  tender: any,
  rankedBids: any[]
): string {
  const l1 = rankedBids[0];
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `========================================================================================
CENTRAL PUBLIC PROCUREMENT PORTAL (CPPP) - GOVERNMENT OF INDIA
MINISTRY OF HOME AFFAIRS / PROCUREMENT DIVISION
OFFICIAL COMPARATIVE STATEMENT OF BIDS (FINANCIAL PACKET B OPENING)
========================================================================================
TENDER REFERENCE: ${tender.referenceNo}
TENDER TITLE: ${tender.title}
ESTIMATED COST: Rs. ${Number(tender.estimatedValue || 25000000).toLocaleString("en-IN")}
EVALUATION NORM: Rule 173 of General Financial Rules (GFR 2017) - Lowest Evaluated L1
DATE OF COMMITTEE MEETING: ${dateStr}
CHAIRED BY: Rajesh Kumar, Deputy Secretary (Procurement), Ministry of Home Affairs

----------------------------------------------------------------------------------------
BIDDER RANKING & COMPARATIVE SUMMARY
----------------------------------------------------------------------------------------
Rank | Bidder Organization                     | Evaluated Price (INR) | Deviation from Est. | Status
-----|-----------------------------------------|-----------------------|---------------------|---------
${rankedBids
  .map(
    (b, idx) =>
      `L${idx + 1}   | ${(b.bidder?.bidderProfile?.companyName || b.bidder?.name || "Bidder").padEnd(39)} | Rs. ${Number(b.evaluatedPrice).toLocaleString("en-IN").padEnd(17)} | ${b.deviation.padEnd(19)} | ${b.status}`
  )
  .join("\n")}

----------------------------------------------------------------------------------------
RECOMMENDATION OF THE TECHNICAL & FINANCIAL EVALUATION COMMITTEE
----------------------------------------------------------------------------------------
1. The Financial Bids (Packet B) of all technically qualified bidders were opened in the
   presence of authorized bidder representatives.
2. The bid of ${l1?.bidder?.bidderProfile?.companyName || "ABC Tech Solutions Private Limited"} quoted at Rs. ${Number(l1?.evaluatedPrice).toLocaleString("en-IN")}
   has been evaluated as the LOWEST RESPONSIVE BID (L1).
3. The quoted price represents a savings of ${l1?.savingsPercent || "17.76%"} against the approved budget estimate.
4. The Committee unanimously recommends awarding the contract to ${l1?.bidder?.bidderProfile?.companyName || "ABC Tech Solutions Private Limited"}
   subject to the submission of 5% Performance Bank Guarantee (PBG) within 14 days.

SIGNATURES OF TENDER EVALUATION COMMITTEE MEMBERS:

1. [Signed: Rajesh Kumar]          2. [Signed: Dr. S. K. Verma]        3. [Signed: P. N. Rao]
   Deputy Secretary (Procurement)     Director (Finance) & IFA             Technical Expert / STQC
   Ministry of Home Affairs           Ministry of Home Affairs             MeitY, New Delhi
========================================================================================`;
}

export function generateLetterOfAward(
  tender: any,
  winningBid: any,
  officerName: string = "Rajesh Kumar, Deputy Secretary"
): string {
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  // Deterministic LOA number: derived from tender reference + year (no Math.random)
  // Same tender always produces the same LOA dispatch number for audit consistency.
  const tenderSeed = tender?.referenceNo || tender?.id || "TENDER";
  const loaSerial = tenderSeed
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase()
    .split("")
    .reduce((acc: number, ch: string) => (acc * 31 + ch.charCodeAt(0)) & 0xffffff, 0)
    .toString()
    .padStart(6, "0")
    .slice(-6);
  const loaNumber = `MHA/PROC/2026/LOA-${loaSerial}`;
  const company = winningBid?.bidder?.bidderProfile?.companyName || "ABC Tech Solutions Private Limited";
  const gstin = winningBid?.bidder?.bidderProfile?.gstin || "27ABCDE1234F1Z5";
  const price = winningBid?.evaluatedPrice || 20558000;
  const pbgAmount = Math.round(price * 0.05);

  return `========================================================================================
GOVERNMENT OF INDIA
MINISTRY OF HOME AFFAIRS
CENTRAL ARMED POLICE FORCES PROCUREMENT DIVISION
NORTH BLOCK, NEW DELHI - 110001
========================================================================================
SPEED POST / REGISTERED E-MAIL
DISPATCH NUMBER: ${loaNumber}
DATE OF ISSUE: ${dateStr}

TO:
${company}
GSTIN: ${gstin}
Plot 42, Electronics Zone, Pune, Maharashtra

SUBJECT: LETTER OF AWARD (LOA) FOR CONTRACT AGAINST TENDER ${tender.referenceNo}
REF: 1. GeM Tender Notice No: ${tender.referenceNo}
     2. Your Technical & Financial Electronic Bid No: ${winningBid.id}

Sir / Madam,

1. ACCEPTANCE OF TENDER:
   The Competent Authority in the Ministry of Home Affairs is pleased to accept your
   electronic proposal for the work:
   "${tender.title}"
   at your quoted evaluated contract price of:
   Rs. ${Number(price).toLocaleString("en-IN")} (Rupees Two Crore Five Lakh Fifty-Eight Thousand Only)
   all-inclusive of GST, transit insurance, packing, delivery, installation and 3-year warranty.

2. PERFORMANCE SECURITY:
   In accordance with Clause 14 of the General Financial Rules (GFR 2017), you are
   hereby required to submit a Performance Bank Guarantee (PBG) equivalent to 5% of
   the contract value, amounting to:
   Rs. ${Number(pbgAmount).toLocaleString("en-IN")}
   from any Scheduled Commercial Bank in India in favour of "Pay & Accounts Officer, MHA",
   valid for a period of sixty (60) days beyond the date of completion of all contractual obligations.

3. COMMENCEMENT OF WORK:
   You are directed to execute the formal contract agreement on non-judicial stamp paper of
   requisite value within fifteen (15) calendar days from the date of issue of this letter.

Yours faithfully,

For and on behalf of the President of India,

(Rajesh Kumar)
Deputy Secretary to the Government of India
Ministry of Home Affairs, New Delhi
Seal of the Ministry of Home Affairs
========================================================================================`;
}

export function generateComparativeStatementCSV(
  tender: any,
  rankedBids: any[]
): string {
  const estimated = Number(tender.estimatedValue || 25000000);
  const rows = [
    ["CENTRAL PUBLIC PROCUREMENT PORTAL - GOVERNMENT OF INDIA"],
    ["MINISTRY OF HOME AFFAIRS / PROCUREMENT DIVISION"],
    ["FINANCIAL COMPARATIVE STATEMENT (CS) - GFR 2017 RULE 173 COMPLIANCE"],
    [""],
    ["Tender Reference:", `"${tender.referenceNo}"`],
    ["Tender Title:", `"${tender.title.replace(/"/g, '""')}"`],
    ["Department:", `"${tender.department}"`],
    ["Approved Budget Estimate (INR):", estimated],
    ["Date of Evaluation:", `"${new Date().toLocaleDateString("en-IN")}"`],
    [""],
    [
      "Rank",
      "Bidder Organization",
      "GSTIN",
      "Base Price Before GST (INR)",
      "Evaluated Proposal Price (INR)",
      "Budget Variance (INR)",
      "Deviation (%)",
      "Evaluation Status",
      "Statutory Recommendation",
    ],
    ...rankedBids.map((b, idx) => {
      const price = Number(b.evaluatedPrice || 0);
      const diff = price - estimated;
      const deviation = `${((diff / estimated) * 100).toFixed(2)}%`;
      const isL1 = idx === 0;
      return [
        `L${idx + 1}`,
        `"${(b.bidder?.bidderProfile?.companyName || b.bidder?.name || "Bidder").replace(/"/g, '""')}"`,
        `"${b.bidder?.bidderProfile?.gstin || "27ABCDE1234F1Z5"}"`,
        Math.round(price / 1.18),
        price,
        diff,
        deviation,
        b.status || (isL1 ? "L1_RECOMMENDED" : "RESPONSIVE"),
        isL1 ? '"RECOMMENDED FOR CONTRACT AWARD UNDER GFR RULE 173"' : '"QUALIFIED BUT NOT L1"',
      ];
    }),
    [""],
    ["Tender Evaluation Committee Signatures:"],
    ["1. Rajesh Kumar, Deputy Secretary (Procurement)"],
    ["2. Dr. S. K. Verma, Director (Finance) & IFA"],
    ["3. P. N. Rao, Technical Expert / STQC"],
  ];

  return rows.map((r) => r.join(",")).join("\r\n");
}

export function downloadCSV(filename: string, csvContent: string) {
  // Add UTF-8 BOM so Microsoft Excel and Google Sheets render numbers & formatting correctly
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadReport(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
