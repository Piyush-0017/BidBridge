"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { GSTNVerificationResult, PANVerificationResult, UdyamVerificationResult } from "@/lib/statutoryVerification";

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    companyName: "",
    gstin: "",
    pan: "",
    udyamNumber: "",
    address: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Statutory Verification States
  const [verifying, setVerifying] = useState(false);
  const [gstResult, setGstResult] = useState<GSTNVerificationResult | null>(null);
  const [panResult, setPanResult] = useState<PANVerificationResult | null>(null);
  const [udyamResult, setUdyamResult] = useState<UdyamVerificationResult | null>(null);
  const [certHash, setCertHash] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((u) => {
        if (u) {
          const initialForm = {
            name: u.name || "",
            email: u.email || "",
            companyName: u.bidderProfile?.companyName || "ABC Tech Solutions Pvt. Ltd.",
            gstin: u.bidderProfile?.gstin || "27AABCU9603R1ZM",
            pan: u.bidderProfile?.pan || "AABCU9603R",
            udyamNumber: u.bidderProfile?.udyamNumber || "UDYAM-MH-01-0012345",
            address: u.bidderProfile?.address || "Tower B, Cyber City, Mumbai, Maharashtra - 400051",
          };
          setForm(initialForm);

          // Auto-run verification on load if values exist
          if (initialForm.gstin && initialForm.pan) {
            runFullVerification(initialForm);
          }
        }
      })
      .catch(() => {});
  }, []);

  async function runFullVerification(formData = form) {
    setVerifying(true);
    try {
      const res = await fetch("/api/compliance/statutory-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ALL",
          gstin: formData.gstin,
          pan: formData.pan,
          udyamNumber: formData.udyamNumber,
          companyName: formData.companyName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setGstResult(data.report.gstn || null);
          setPanResult(data.report.pan || null);
          setUdyamResult(data.report.udyam || null);
          setCertHash(data.report.section65BCertificateHash || null);
        }
      }
    } catch (e) {
      console.error("Verification failed", e);
    } finally {
      setVerifying(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setMsg(d.error || "Failed to update profile");
        return;
      }
      setMsg("✅ Profile & Statutory credentials saved successfully.");
      runFullVerification();
    } catch {
      setMsg("⚠️ Network error while saving profile");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 5000);
    }
  }

  return (
    <Shell role="bidder" title="Company Profile & Statutory Registries">
      <div className="space-y-6 max-w-4xl">
        {msg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
            <span>{msg}</span>
            <button onClick={() => setMsg("")} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
          </div>
        )}

        {/* Verification Overview Header */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏛️</span>
              <h2 className="text-xl font-black text-slate-900">National Registry Verification Status</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your GSTN, PAN, and Udyam MSME certificates are automatically verified against Government of India databases.
            </p>
          </div>

          <button
            type="button"
            onClick={() => runFullVerification()}
            disabled={verifying}
            className="btn-gov-primary text-xs font-bold px-4 py-2.5 flex items-center gap-2 self-start md:self-auto disabled:opacity-50"
          >
            {verifying ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Connecting to Registries...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Re-Verify Registries</span>
              </>
            )}
          </button>
        </div>

        {/* Live Statutory Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* GSTN Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>🧾</span> GSTN Registry
              </span>
              {gstResult?.valid ? (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  ✓ Active Regular
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-full border border-rose-200">
                  ✕ Unverified
                </span>
              )}
            </div>
            <p className="font-mono text-xs font-extrabold text-slate-900">{form.gstin || "Not provided"}</p>
            {gstResult?.valid && (
              <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                <p>State: <strong>{gstResult.stateName}</strong></p>
                <p>GSTR-3B: <strong className="text-emerald-700">{gstResult.gstr3bStatus}</strong></p>
              </div>
            )}
          </div>

          {/* PAN Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>💳</span> Income Tax PAN
              </span>
              {panResult?.valid ? (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  ✓ Operative
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-full border border-rose-200">
                  ✕ Invalid
                </span>
              )}
            </div>
            <p className="font-mono text-xs font-extrabold text-slate-900">{form.pan || "Not provided"}</p>
            {panResult?.valid && (
              <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                <p>Entity: <strong>{panResult.entityType}</strong></p>
                <p>Aadhaar / ITR: <strong className="text-emerald-700">{panResult.lastItrFiledYear}</strong></p>
              </div>
            )}
          </div>

          {/* Udyam MSME Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>🏭</span> Udyam MSME
              </span>
              {udyamResult?.valid ? (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-900 rounded-full border border-purple-200">
                  ✓ {udyamResult.enterpriseType} Enterprise
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full">
                  Optional
                </span>
              )}
            </div>
            <p className="font-mono text-xs font-extrabold text-slate-900">{form.udyamNumber || "None"}</p>
            {udyamResult?.valid && (
              <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                <p>EMD Exemption: <strong className="text-purple-700">Eligible (GFR 153)</strong></p>
                <p>Activity: <strong>{udyamResult.majorActivity}</strong></p>
              </div>
            )}
          </div>
        </div>

        {/* Section 65B Digital Verification Stamp */}
        {certHash && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🛡️</span>
              <div>
                <span className="font-bold text-blue-950 block">Section 65B Cryptographic Compliance Certificate</span>
                <span className="text-[10px] font-mono text-blue-800">
                  Verification SHA-256: {certHash.slice(0, 36)}...
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
              Tamper-Proof
            </span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={save} className="card p-6 bg-white border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Corporate Entity & Communication Details
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Authorized Contact Person *</label>
              <input
                required
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registered e-Procurement Email</label>
              <input
                className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 text-slate-500 font-mono"
                value={form.email}
                disabled
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Registered Legal Company Name *</label>
            <input
              required
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003366]"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Goods and Services Tax Identification Number (GSTIN) *
              </label>
              <input
                required
                placeholder="27AABCU9603R1ZM"
                className="w-full text-xs font-mono uppercase rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Permanent Account Number (PAN) *
              </label>
              <input
                required
                placeholder="AABCU9603R"
                className="w-full text-xs font-mono uppercase rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                value={form.pan}
                onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              MSME Udyam Registration Number (For EMD / Fee Exemption)
            </label>
            <input
              placeholder="UDYAM-MH-01-0012345"
              className="w-full text-xs font-mono uppercase rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003366]"
              value={form.udyamNumber}
              onChange={(e) => setForm({ ...form, udyamNumber: e.target.value.toUpperCase() })}
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Format: UDYAM-XX-00-0000000 (Ministry of Micro, Small and Medium Enterprises)
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Registered Principal Office Address *</label>
            <textarea
              required
              rows={2}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003366]"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-gov-primary text-xs font-bold px-6 py-2.5 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save Corporate Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
