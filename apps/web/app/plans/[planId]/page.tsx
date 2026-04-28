import { PlanDetail } from "../../../src/features/home/plan-detail";

export default async function PlanDetailPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  return <PlanDetail planId={planId} />;
}

