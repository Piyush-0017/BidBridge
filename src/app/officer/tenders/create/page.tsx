"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";

export default function CreateTender() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    referenceNo: "",
    title: "",
    department: "",
    category: "",
    description: "",
    estimatedValue: "",
    bidEndAt: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : undefined,
          bidEndAt: new Date(form.bidEndAt).toISOString(),
          requirements: [
            { code: "GST_VALID", description: "Valid GST registration", category: "Statutory", mandatory: true, weight: 15 },
            { code: "PAN_VALID", description: "Valid PAN", category: "Statutory", mandatory: true, weight: 10 },
            { code: "TECH_SPEC", description: "Technical specification compliance", category: "Technical", mandatory: true, weight: 30 },
            { code: "FIN_TURN", description: "Financial turnover criteria", category: "Financial", mandatory: true, weight: 25 },
            { code: "EXP_3YR", description: "Experience criteria", category: "Experience", mandatory: true, weight: 20 },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }
      router.push("/officer/tenders");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell role="officer" title="Create Tender">
      <form onSubmit={onSubmit} className="card p-7 max-w-3xl space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Reference No *</label>
            <input className="w-full rounded-lg border px-3 py-2" required value={form.referenceNo}
              onChange={(e) => setForm({ ...form, referenceNo: e.target.value })} placeholder="GEM-2026-XXX-001" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <input className="w-full rounded-lg border px-3 py-2" required value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input className="w-full rounded-lg border px-3 py-2" required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Department *</label>
          <input className="w-full rounded-lg border px-3 py-2" required value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="w-full rounded-lg border px-3 py-2" rows={3} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Estimated Value (₹)</label>
            <input type="number" className="w-full rounded-lg border px-3 py-2" value={form.estimatedValue}
              onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bid End Date *</label>
            <input type="datetime-local" className="w-full rounded-lg border px-3 py-2" required value={form.bidEndAt}
              onChange={(e) => setForm({ ...form, bidEndAt: e.target.value })} />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary px-6 py-2.5">
          {loading ? "Creating..." : "Create Tender (Draft)"}
        </button>
      </form>
    </Shell>
  );
}
