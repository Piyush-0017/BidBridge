const fs = require('fs');
const path = require('path');

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function createSimplePDF(title, contentLines) {
  const textStream = [
    'BT',
    '/F1 16 Tf',
    '50 770 Td',
    '(' + title.replace(/[\(\)]/g, '') + ') Tj',
    '/F1 10 Tf',
    '0 -24 Td',
    '(---------------------------------------------------------------------------------------) Tj',
  ];

  let yOffset = -20;
  for (const line of contentLines) {
    const clean = line.replace(/[\(\)\\]/g, '');
    textStream.push('0 ' + yOffset + ' Td');
    textStream.push('(' + clean + ') Tj');
    yOffset = -16;
  }
  textStream.push('ET');

  const streamContent = textStream.join('\n');
  const streamLength = Buffer.byteLength(streamContent);

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
400
%%EOF`;
  return Buffer.from(pdf, 'utf-8');
}

// 1. GST Certificate
fs.writeFileSync(
  path.join(uploadDir, 'GST_Registration_Certificate_2025.pdf'),
  createSimplePDF('GOVERNMENT OF INDIA - GOODS AND SERVICES TAX REGISTRATION', [
    'FORM GST REG-06 [See Rule 10]',
    'Registration Certificate for Taxpayer',
    'Registration Number GSTIN: 27ABCDE1234F1Z5',
    'Legal Name: ABC TECH SOLUTIONS PRIVATE LIMITED',
    'Trade Name: ABC TECH SOLUTIONS',
    'Constitution of Business: Private Limited Company',
    'Principal Place of Business: Plot 42, Hinjewadi Phase 1, Pune, Maharashtra - 411057',
    'Date of Registration: 01-July-2017',
    'Period of Validity: From 01-July-2017 To Permanent Active',
    'Type of Registration: Regular Taxpayer (Compliant)',
    'Statutory Authority: Superintendent, Ward-3, Pune GST Commissionerate',
    'Cryptographic Seal: SHA-256 Validated against GSTN Central Database',
  ])
);

// 2. PAN Card
fs.writeFileSync(
  path.join(uploadDir, 'Permanent_Account_Number_PAN.pdf'),
  createSimplePDF('INCOME TAX DEPARTMENT - GOVERNMENT OF INDIA', [
    'PERMANENT ACCOUNT NUMBER CARD [FORM 49A]',
    'PAN Number: ABCDE1234F',
    'Entity Name: ABC TECH SOLUTIONS PRIVATE LIMITED',
    'Incorporation Date: 15-March-2014',
    'Jurisdiction: Ward 12, Pune, Maharashtra',
    'Status: Resident Private Limited Company',
    'Tax Return Status: ITR-6 Filed for Assessment Year 2024-2025 (Compliant)',
    'National Tax Identification Registry: 100% Identity Match Verified',
  ])
);

// 3. OEM MAF
fs.writeFileSync(
  path.join(uploadDir, 'OEM_Manufacturer_Authorization_Form.pdf'),
  createSimplePDF('MANUFACTURER AUTHORIZATION FORM [MAF]', [
    'Tender Reference: GEM/2025/B/6123456',
    'To: Ministry of Home Affairs, Government of India',
    'Authorized Bidder: ABC Tech Solutions Private Limited',
    'Product Lines: 4K UHD PTZ IP Cameras [Model AX-800] and Video Storage Servers',
    'Warranty Commitment: 3-Year Comprehensive Onsite Hardware Support Guaranteed',
    'Authorized Territory: Pan-India Central Government Installations',
    'Manufacturer Entity: Sony Starvis Video Security Division',
    'Signatory: Director of Enterprise Government Sales',
  ])
);

console.log('Sample PDFs created successfully in:', uploadDir);
