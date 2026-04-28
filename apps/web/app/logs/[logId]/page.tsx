import { LogDetail } from "../../../src/features/home/log-detail";

export default async function LogDetailPage({ params }: { params: Promise<{ logId: string }> }) {
  const { logId } = await params;
  return <LogDetail logId={logId} />;
}

