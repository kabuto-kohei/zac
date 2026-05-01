import Link from "next/link";
import { AppShell } from "./app-shell";
import { AuthGate } from "./auth-gate";
import { ProtectedPlanDetail } from "./protected-activity-detail";

export function PlanDetail({ planId }: { planId: string }) {
  return (
    <AppShell activeTab="plans" action={<Link className="primary-action" href="/logs/new">記録する</Link>}>
      <AuthGate action="予定詳細はログイン後に閲覧できます">
        <ProtectedPlanDetail planId={planId} />
      </AuthGate>
    </AppShell>
  );
}
