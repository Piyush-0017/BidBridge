import { redirect } from "next/navigation";

export default function RecommendationPage() {
  redirect("/officer/compliance?tab=recommendation");
}
