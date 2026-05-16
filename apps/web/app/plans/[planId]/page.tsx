import { redirect } from "next/navigation";

export default async function PlanDetailPage({ params }: { params: Promise<{ planId: string }> }) {
  await params;
  redirect("/");
}
