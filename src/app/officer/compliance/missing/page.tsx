import { redirect } from "next/navigation";

export default function MissingPage() {
  redirect("/officer/compliance?tab=inconsistencies");
}
