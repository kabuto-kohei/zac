import { V2PlaceholderPage } from "../../../src/features/home/v2-placeholder";

export default async function PlanDetailPage({ params }: { params: Promise<{ planId: string }> }) {
  await params;
  return <V2PlaceholderPage activeTab="plans" featureName="予定詳細" />;
}
