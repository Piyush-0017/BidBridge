import { redirect } from "next/navigation";

export default function RiskPage() {
  redirect("/officer/compliance?tab=risk");
}
