import type { ReactNode } from "react";
import Link from "next/link";
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
        <Link className="topbar-brand" href="/">
          <ZacIcon icon="logo" size={56} />
          <div>
            <h1>Zac</h1>
            <p className="topbar-subtitle">ジムとイベントの公式情報カレンダー</p>
          </div>
        </Link>
        <ShellActions>{action}</ShellActions>
      </section>

      <ShellNavigation activeTab={activeTab} />

      {children}
    </main>
  );
}

export function MetricStripView({
  events,
  gyms,
}: {
  events: number;
  gyms: number;
}) {
  return (
    <section className="metric-strip" aria-label="V1 scope summary">
      <Metric label="掲載イベント" value={String(events)} />
      <Metric label="掲載ジム" value={String(gyms)} />
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
