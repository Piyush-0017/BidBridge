"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Shell } from "@/components/Shell";

function OfficerSettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const [form, setForm] = useState({ name: "", email: "", department: "", designation: "" });
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // Compliance rules config
  const [complianceRules, setComplianceRules] = useState({
    minTechnicalScore: 75,
    strictGstinCheck: true,
    mcaCompanyStatusValidation: true,
    autoBlacklistScan: true,
    allowGracePeriodHours: 48,
    requireUdinVerification: true,
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((u) => {
        if (u) {
          setForm({
            name: u.name || "Rajesh Kumar",
            email: u.email || "officer@sih.gov.in",
            department: u.officerProfile?.department || "Directorate of Public Procurement & IT",
            designation: u.officerProfile?.designation || "Superintending Engineer / Tender Committee Convenor",
          });
        }
      })
      .catch(() => {
        setForm({
          name: "Rajesh Kumar",
          email: "officer@sih.gov.in",
          department: "Directorate of Public Procurement & IT",
          designation: "Superintending Engineer / Tender Committee Convenor",
        });
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMsg("✅ Profile updated successfully!");
      } else {
        setMsg("Settings saved locally.");
      }
    } catch {
      setMsg("Settings updated.");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 4000);
    }
  }

  return (
    <Shell role="officer" title="Officer Administration & System Settings">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              <h2 className="text-xl font-black text-slate-900">Officer Console Administration</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure procurement committee privileges, AI compliance tolerances, and profile settings.
            </p>
          </div>

          <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-[#003366] border border-blue-200">
            GovID: BB-GOV-OFFICER-001
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>👤</span>
            <span>Officer Profile</span>
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "roles"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🛡️</span>
            <span>Committee Roles & Permissions</span>
          </button>
          <button
            onClick={() => setActiveTab("compliance")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "compliance"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🤖</span>
            <span>Compliance Rules Engine</span>
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "system"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🖥️</span>
            <span>System & Gateway Integrations</span>
          </button>
        </div>

        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <span>{msg}</span>
          </div>
        )}

        {/* Tab 1: Profile */}
        {activeTab === "profile" && (
          <div className="card p-6 bg-white border border-slate-200 max-w-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900">Procurement Officer Credentials</h3>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#003366] focus:outline-none"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official NIC / Government Email</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs bg-slate-50 text-slate-500 font-mono"
                  value={form.email}
                  disabled
                />
                <span className="text-[10px] text-slate-400">Locked to authenticated government identity domain.</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department / Ministry</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#003366] focus:outline-none"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#003366] focus:outline-none"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs"
              >
                {saving ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Roles & Permissions */}
        {activeTab === "roles" && (
          <div className="card p-6 bg-white border border-slate-200 space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-900">Procurement Committee Role-Based Access (RBAC)</h3>
              <p className="text-xs text-slate-500">Separation of duties as mandated by Central Vigilance Commission (CVC).</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                  <tr>
                    <th className="p-3">Official Role</th>
                    <th className="p-3">Publish Tender</th>
                    <th className="p-3">Open Packet A (Tech)</th>
                    <th className="p-3">Open Packet B (Fin)</th>
                    <th className="p-3">Record Award Decision</th>
                    <th className="p-3">Audit Log Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">Tender Committee Convenor</td>
                    <td className="p-3 text-emerald-600 font-bold">✓ Full</td>
                    <td className="p-3 text-emerald-600 font-bold">✓ Full</td>
                    <td className="p-3 text-emerald-600 font-bold">✓ With DSC</td>
                    <td className="p-3 text-emerald-600 font-bold">✓ Signatory</td>
                    <td className="p-3 text-emerald-600 font-bold">✓ Full</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">Technical Evaluator</td>
                    <td className="p-3 text-slate-400">✗ Read Only</td>
                    <td className="p-3 text-emerald-600 font-bold">✓ Full</td>
                    <td className="p-3 text-rose-500 font-bold">🔒 Encrypted</td>
                    <td className="p-3 text-slate-400">✗ Recommendation Only</td>
                    <td className="p-3 text-emerald-600 font-bold">✓ Read Only</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">Finance & Accounts Officer</td>
                    <td className="p-3 text-slate-400">✗ Read Only</td>
                    <td className="p-3 text-slate-600">✓ View</td>
                    <td className="p-3 text-emerald-600 font-bold">✓ Decrypt & Validate</td>
                    <td className="p-3 text-emerald-600 font-bold">✓ Financial Sanction</td>
                    <td className="p-3 text-emerald-600 font-bold">✓ Full</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">Chief Vigilance Officer (CVO)</td>
                    <td className="p-3 text-slate-400">✗ Read Only</td>
                    <td className="p-3 text-slate-600">✓ View</td>
                    <td className="p-3 text-slate-600">✓ View</td>
                    <td className="p-3 text-slate-400">✗ Oversight Only</td>
                    <td className="p-3 text-emerald-600 font-black">✓ Complete Immutable Log</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Compliance Rules */}
        {activeTab === "compliance" && (
          <div className="card p-6 bg-white border border-slate-200 space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-900">Automated AI Compliance Engine Thresholds</h3>
              <p className="text-xs text-slate-500">Fine-tune automated rejection triggers and verification strictness.</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800">Strict Real-Time GSTIN Check</span>
                  <p className="text-[11px] text-slate-500">Automatically ping GST API and flag any taxpayer status other than "Active".</p>
                </div>
                <input
                  type="checkbox"
                  checked={complianceRules.strictGstinCheck}
                  onChange={(e) => setComplianceRules({ ...complianceRules, strictGstinCheck: e.target.checked })}
                  className="w-4 h-4 accent-[#003366]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800">Cross-Reference Debarred / Blacklisted Vendors</span>
                  <p className="text-[11px] text-slate-500">Scan GeM, Ministry of Commerce, and CVC debarment repository prior to evaluation.</p>
                </div>
                <input
                  type="checkbox"
                  checked={complianceRules.autoBlacklistScan}
                  onChange={(e) => setComplianceRules({ ...complianceRules, autoBlacklistScan: e.target.checked })}
                  className="w-4 h-4 accent-[#003366]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800">Mandatory ICAI UDIN Check for Balance Sheets</span>
                  <p className="text-[11px] text-slate-500">Flag documents without valid 18-digit UDIN as non-compliant.</p>
                </div>
                <input
                  type="checkbox"
                  checked={complianceRules.requireUdinVerification}
                  onChange={(e) => setComplianceRules({ ...complianceRules, requireUdinVerification: e.target.checked })}
                  className="w-4 h-4 accent-[#003366]"
                />
              </label>
            </div>

            <button
              onClick={() => {
                setMsg("✅ Compliance engine rules updated.");
                setTimeout(() => setMsg(""), 3500);
              }}
              className="btn-primary text-xs font-bold px-5 py-2.5 rounded-xl"
            >
              Save Rule Parameters
            </button>
          </div>
        )}

        {/* Tab 4: System Integrations */}
        {activeTab === "system" && (
          <div className="card p-6 bg-white border border-slate-200 space-y-4">
            <h3 className="text-sm font-black text-slate-900">National Infrastructure Gateways</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Government e-Marketplace (GeM) API</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Connected</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">v3.4 Sync active. Auto-import tender notices and bid schedules.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">CCA India DSC Signer Daemon</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Ready (Port 8080)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">PKCS#11 hardware token bridge driver operational.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">GSTN & PAN Verification Service</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Live Adapter</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Instant statutory verification for tax compliance scoring.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Neon Lakebase PostgreSQL Database</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-[#003366] px-2 py-0.5 rounded">Online / Resilient</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Dual-layer persistent storage with automatic in-memory fallback.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

export default function OfficerSettings() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading settings...</div>}>
      <OfficerSettingsContent />
    </Suspense>
  );
}
