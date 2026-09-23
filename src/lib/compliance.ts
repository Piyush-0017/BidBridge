export type Status = "VERIFIED" | "MISSING" | "FAILED" | "INCONSISTENT" | "EXPIRED" | "PENDING";

export function score(items: { status: Status; weight: number }[]) {
  const total = items.reduce((a, b) => a + b.weight, 0) || 1;
  const earned = items.reduce((a, b) => a + (b.status === "VERIFIED" ? b.weight : 0), 0);
  return Math.round((earned / total) * 100);
}

export function risk(s: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (s >= 85) return "LOW";
  if (s >= 70) return "MEDIUM";
  if (s >= 50) return "HIGH";
  return "CRITICAL";
}
