import Link from "next/link";
import type { ReactNode } from "react";
import { ShellActions } from "./shell-actions";
import { ZacIcon, type ZacIconKey } from "./zac-icons";

export type Tab = "home" | "explore" | "plans" | "logs" | "me";

const navItems: Array<{ id: Tab; href: string; label: string; icon?: ZacIconKey; textIcon?: string }> = [
  { id: "home", href: "/home", label: "ホーム", textIcon: "⌂" },
  { id: "explore", href: "/explore", label: "探す", icon: "gym" },
  { id: "plans", href: "/plans", label: "予定", icon: "sessionPlan" },
  { id: "logs", href: "/logs", label: "記録", icon: "climbLog" },
  { id: "me", href: "/me", label: "マイ", textIcon: "○" },
];

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
            <p className="eyebrow">Zac</p>
            <h1>次のセッションを決める</h1>
          </div>
        </div>
        {action ?? <ShellActions />}
      </section>

      <nav className="bottom-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            aria-current={item.id === activeTab ? "page" : undefined}
            className={item.id === activeTab ? "nav-item active" : "nav-item"}
            href={item.href}
            key={item.id}
          >
            {item.icon ? (
              <ZacIcon decorative icon={item.icon} size={24} />
            ) : (
              <span aria-hidden="true">{item.textIcon}</span>
            )}
            {item.label}
          </Link>
        ))}
      </nav>

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
