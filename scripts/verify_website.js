// scripts/verify_website.js
const http = require("http");

const BASE = "http://localhost:3000";

async function request(path, options = {}) {
  const url = new URL(path, BASE);
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: options.method || "GET",
      headers: options.headers || {},
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
        });
      });
    });
    req.on("error", reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function run() {
  console.log("=== FULL WEBSITE VERIFICATION REPORT ===");
  const results = [];

  // 1. Health check
  try {
    const health = await request("/api/health");
    results.push({ target: "/api/health", type: "Health API", status: health.status, ok: health.status === 200 });
  } catch (e) {
    results.push({ target: "/api/health", type: "Health API", status: "ERR", ok: false });
  }

  // 2. Public Pages
  const publicPages = ["/", "/login", "/signup", "/bidder-guide"];
  for (const page of publicPages) {
    try {
      const res = await request(page);
      results.push({ target: page, type: "Public Page", status: res.status, ok: res.status === 200 });
    } catch (e) {
      results.push({ target: page, type: "Public Page", status: "ERR", ok: false });
    }
  }

  // 3. Officer Login
  let officerCookie = "";
  try {
    const loginRes = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "officer@sih.gov.in", password: "Password@123" }),
    });
    const setCookie = loginRes.headers["set-cookie"];
    if (setCookie) {
      officerCookie = Array.isArray(setCookie) ? setCookie[0].split(";")[0] : setCookie.split(";")[0];
    }
    results.push({ target: "Login (Officer)", type: "Auth", status: loginRes.status, ok: loginRes.status === 200 && !!officerCookie });
  } catch (e) {
    results.push({ target: "Login (Officer)", type: "Auth", status: "ERR", ok: false });
  }

  // 4. Officer Protected Routes
  const officerPages = [
    "/officer",
    "/officer/tenders",
    "/officer/tenders/create",
    "/officer/tenders/import",
    "/officer/tenders/requirements",
    "/officer/tenders/corrigendum",
    "/officer/bids",
    "/officer/bidders",
    "/officer/compliance",
    "/officer/compliance/documents",
    "/officer/evaluation/technical",
    "/officer/evaluation/financial",
    "/officer/evaluation/comparative",
    "/officer/evaluation/shortlisting",
    "/officer/decision",
    "/officer/audit",
    "/officer/reports",
    "/officer/settings",
  ];

  for (const page of officerPages) {
    try {
      const res = await request(page, {
        headers: { Cookie: officerCookie },
      });
      // 200 means rendered, 307/308 redirect or 200
      results.push({ target: page, type: "Officer Page", status: res.status, ok: res.status === 200 });
    } catch (e) {
      results.push({ target: page, type: "Officer Page", status: "ERR", ok: false });
    }
  }

  // 5. Bidder Login
  let bidderCookie = "";
  try {
    const loginRes = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "bidder1@abctech.com", password: "Password@123" }),
    });
    const setCookie = loginRes.headers["set-cookie"];
    if (setCookie) {
      bidderCookie = Array.isArray(setCookie) ? setCookie[0].split(";")[0] : setCookie.split(";")[0];
    }
    results.push({ target: "Login (Bidder)", type: "Auth", status: loginRes.status, ok: loginRes.status === 200 && !!bidderCookie });
  } catch (e) {
    results.push({ target: "Login (Bidder)", type: "Auth", status: "ERR", ok: false });
  }

  // 6. Bidder Protected Routes
  const bidderPages = [
    "/bidder",
    "/bidder/tenders",
    "/bidder/tender",
    "/bidder/bid-preparation",
    "/bidder/documents",
    "/bidder/compliance",
    "/bidder/review",
    "/bidder/submission",
    "/bidder/my-bids",
    "/bidder/notifications",
    "/bidder/profile",
  ];

  for (const page of bidderPages) {
    try {
      const res = await request(page, {
        headers: { Cookie: bidderCookie },
      });
      results.push({ target: page, type: "Bidder Page", status: res.status, ok: res.status === 200 });
    } catch (e) {
      results.push({ target: page, type: "Bidder Page", status: "ERR", ok: false });
    }
  }

  // 7. Key APIs
  const apis = [
    { path: "/api/tenders", cookie: bidderCookie },
    { path: "/api/bids", cookie: bidderCookie },
    { path: "/api/profile", cookie: bidderCookie },
    { path: "/api/audit", cookie: officerCookie },
    { path: "/api/notifications", cookie: bidderCookie },
  ];

  for (const api of apis) {
    try {
      const res = await request(api.path, {
        headers: { Cookie: api.cookie },
      });
      results.push({ target: api.path, type: "API Endpoint", status: res.status, ok: res.status === 200 });
    } catch (e) {
      results.push({ target: api.path, type: "API Endpoint", status: "ERR", ok: false });
    }
  }

  // Summary
  console.table(results);
  const total = results.length;
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`\nTOTAL CHECKS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
}

run();
