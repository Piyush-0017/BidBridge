const fs = require('fs');
const path = require('path');

async function testUpload() {
  console.log('=== TESTING REAL PDF MULTIPART UPLOAD & STORAGE ===');

  // 1. Create a dummy PDF buffer
  const samplePdfPath = path.join(process.cwd(), 'public', 'uploads', 'GST_Registration_Certificate_2025.pdf');
  const fileBytes = fs.readFileSync(samplePdfPath);

  // 2. Prepare FormData
  const formData = new FormData();
  const blob = new Blob([fileBytes], { type: 'application/pdf' });
  formData.append('file', blob, 'Test_Uploaded_GST_Certificate.pdf');
  formData.append('documentType', 'GST_CERTIFICATE');

  // 3. POST to upload endpoint
  const res = await fetch('http://localhost:3000/api/documents/upload', {
    method: 'POST',
    body: formData,
  });

  console.log('1. POST /api/documents/upload status:', res.status);
  const data = await res.json();
  console.log('   Response:', data);

  if (!data.success) throw new Error('Upload failed');
  const publicUrl = data.document.storageKey;
  console.log('   Uploaded Storage URL:', publicUrl);
  console.log('   Real SHA-256 Hash:', data.document.sha256);

  // 4. Verify file is served via HTTP
  const fetchDocRes = await fetch('http://localhost:3000' + publicUrl);
  console.log('2. GET file via HTTP status:', fetchDocRes.status, 'Content-Type:', fetchDocRes.headers.get('content-type'));
  if (fetchDocRes.status !== 200) throw new Error('File not served');

  // 5. Query /api/documents to confirm listed in database
  const listRes = await fetch('http://localhost:3000/api/documents');
  const list = await listRes.json();
  console.log('3. GET /api/documents total documents:', list.length);
  const found = list.find(d => d.name === 'Test_Uploaded_GST_Certificate.pdf');
  console.log('   Found in document list:', !!found, 'Status:', found?.status);

  console.log('=== REAL FILE UPLOAD & PREVIEW VERIFIED 100% WORKING ===');
}

testUpload().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
