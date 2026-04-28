import Link from "next/link";
import { AppShell, MetricStrip, type Tab } from "./app-shell";
import { GymCard, LogCard, PlanCard } from "./cards";
import { gyms, logs, plans } from "./mock-data";

export function WebAppHome({ activeTab }: { activeTab: Tab }) {
  return (
    <AppShell activeTab={activeTab}>
      <MetricStrip />
      {activeTab === "explore" ? <ExplorePanel /> : null}
      {activeTab === "plans" ? <PlansPanel /> : null}
      {activeTab === "logs" ? <LogsPanel /> : null}
      {activeTab === "me" ? <ProfilePanel /> : null}
      {activeTab === "home" ? <HomeFeed /> : null}
    </AppShell>
  );
}

function HomeFeed() {
  return (
    <section className="stack">
      <div className="section-title">
        <h2>フィード</h2>
        <span>Following</span>
      </div>
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
      {logs.slice(0, 1).map((log) => (
        <LogCard key={log.id} log={log} />
      ))}
    </section>
  );
}

function ExplorePanel() {
  return (
    <section className="stack">
      <label className="search-box">
        <span>ジム検索</span>
        <input placeholder="エリア、ジム名、種目" />
      </label>
      {gyms.map((gym) => (
        <GymCard gym={gym} key={gym.id} />
      ))}
    </section>
  );
}

function PlansPanel() {
  return (
    <section className="stack">
      <div className="section-title">
        <h2>予定</h2>
        <Link className="primary-action" href="/plans/new">
          作成
        </Link>
      </div>
      {plans.map((plan) => (
        <article className="wide-card" key={plan.id}>
          <p className="card-kind">{plan.time}</p>
          <h3>{plan.title}</h3>
          <p>
            {plan.place} · {plan.members}
          </p>
        </article>
      ))}
    </section>
  );
}

function LogsPanel() {
  return (
    <section className="stack">
      <div className="section-title">
        <h2>記録</h2>
        <Link className="primary-action" href="/logs/new">
          追加
        </Link>
      </div>
      {logs.map((log) => (
        <article className="wide-card" key={log.id}>
          <p className="card-kind">{log.place}</p>
          <h3>{log.title}</h3>
          <p>
            {log.grade} · {log.note}
          </p>
        </article>
      ))}
    </section>
  );
}

function ProfilePanel() {
  return (
    <section className="profile-panel">
      <div className="avatar" />
      <div>
        <p className="card-kind">ボルダー · 東京</p>
        <h2>Climber</h2>
        <p>よく行くジム、予定、記録をここに集約する。</p>
      </div>
    </section>
  );
}

