import { ReportForm } from "../../../src/features/home/report-form";

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ targetId?: string; targetType?: string }>;
}) {
  const params = await searchParams;
  return <ReportForm initialTargetId={params.targetId ?? ""} initialTargetType={params.targetType ?? "post"} />;
}
