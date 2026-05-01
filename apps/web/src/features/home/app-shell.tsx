import type { ReactNode } from "react";
import { ShellNavigation } from "./shell-navigation";
import { ShellActions } from "./shell-actions";
import { ZacIcon } from "./zac-icons";

export type Tab = "home" | "explore" | "plans" | "logs" | "me";

export function AppShell({
  activeTab,
  children,
  action,
}: {
  activeTab: Tab;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Zac overview">
        <div className="topbar-brand">
          <ZacIcon icon="logo" size={56} />
          <div>
            <h1>Zac</h1>
            <p className="topbar-subtitle">次のセッションを決める</p>
          </div>
        </div>
        <ShellActions>{action}</ShellActions>
      </section>

      <ShellNavigation activeTab={activeTab} />

      {children}
    </main>
  );
}

export function MetricStrip() {
  return <MetricStripView weeklyPlans={2} savedGyms={3} logs={8} />;
}

export function MetricStripView({
  weeklyPlans,
  savedGyms,
  logs,
}: {
  weeklyPlans: number;
  savedGyms: number;
  logs: number;
}) {
  return (
    <section className="metric-strip" aria-label="Weekly summary">
      <Metric label="今週の予定" value={String(weeklyPlans)} />
      <Metric label="保存ジム" value={String(savedGyms)} />
      <Metric label="記録" value={String(logs)} />
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
