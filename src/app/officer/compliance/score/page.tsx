import { redirect } from "next/navigation";

export default function ScorePage() {
  redirect("/officer/compliance?tab=dashboard");
}
