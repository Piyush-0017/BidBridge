import { redirect } from "next/navigation";

export default function InconsistenciesPage() {
  redirect("/officer/compliance?tab=inconsistencies");
}
