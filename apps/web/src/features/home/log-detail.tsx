import Link from "next/link";
import { AppShell } from "./app-shell";
import { AuthGate } from "./auth-gate";
import { ProtectedLogDetail } from "./protected-activity-detail";

export function LogDetail({ logId }: { logId: string }) {
  return (
    <AppShell activeTab="logs" action={<Link className="primary-action" href="/plans/new">次回予定</Link>}>
      <AuthGate action="記録詳細はログイン後に閲覧できます">
        <ProtectedLogDetail logId={logId} />
      </AuthGate>
    </AppShell>
  );
}
