import Link from "next/link";
import type { ReactNode } from "react";

export type Tab = "home" | "explore" | "plans" | "logs" | "me";

const navItems: Array<{ id: Tab; href: string; label: string; icon: string }> = [
  { id: "home", href: "/home", label: "ホーム", icon: "⌂" },
  { id: "explore", href: "/explore", label: "探す", icon: "⌕" },
  { id: "plans", href: "/plans", label: "予定", icon: "□" },
  { id: "logs", href: "/logs", label: "記録", icon: "◫" },
  { id: "me", href: "/me", label: "マイ", icon: "○" },
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
        <div>
          <p className="eyebrow">Zac</p>
          <h1>次のセッションを決める</h1>
        </div>
        {action ?? (
          <Link className="primary-action" href="/plans/new">
            予定
          </Link>
        )}
      </section>

      {children}

      <nav className="bottom-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            aria-current={item.id === activeTab ? "page" : undefined}
            className={item.id === activeTab ? "nav-item active" : "nav-item"}
            href={item.href}
            key={item.id}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
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
