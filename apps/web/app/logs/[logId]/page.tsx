import { V2PlaceholderPage } from "../../../src/features/home/v2-placeholder";

export default async function LogDetailPage({ params }: { params: Promise<{ logId: string }> }) {
  await params;
  return <V2PlaceholderPage activeTab="logs" featureName="クライミングログ詳細" />;
}
