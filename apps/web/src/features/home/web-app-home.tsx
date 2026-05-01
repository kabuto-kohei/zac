import Link from "next/link";
import { AppShell, MetricStripView, type Tab } from "./app-shell";
import { AuthGate } from "./auth-gate";
import { getHomeViewData, type HomeViewData } from "./data";
import { ExplorePanel } from "./explore-panel";
import { FeedExperience } from "./feed-experience";
import { ProfilePanel } from "./profile-panel";

export async function WebAppHome({ activeTab }: { activeTab: Tab }) {
  const data = await getHomeViewData(activeTab);

  return (
    <AppShell activeTab={activeTab}>
      <MetricStripView {...data.metrics} />
      {activeTab === "explore" ? <ExplorePanel data={data} /> : null}
      {activeTab === "plans" ? (
        <AuthGate action="予定の管理はログイン後に使えます">
          <PlansPanel data={data} />
        </AuthGate>
      ) : null}
      {activeTab === "logs" ? (
        <AuthGate action="記録の管理はログイン後に使えます">
          <LogsPanel data={data} />
        </AuthGate>
      ) : null}
      {activeTab === "me" ? (
        <AuthGate action="マイページはログイン後に使えます">
          <ProfilePanel data={data} />
        </AuthGate>
      ) : null}
      {activeTab === "home" ? <FeedExperience data={data} /> : null}
    </AppShell>
  );
}

function PlansPanel({ data }: { data: HomeViewData }) {
  return (
    <section className="stack">
      <div className="section-title">
        <h2>予定</h2>
        <Link className="primary-action" href="/plans/new">
          作成
        </Link>
      </div>
      {data.plans.map((plan) => (
        <article className="wide-card" key={plan.id}>
          <p className="card-kind">{plan.time}</p>
          <h3>
            <Link href={`/plans/${plan.id}`}>{plan.title}</Link>
          </h3>
          <p>
            {plan.place} · {plan.members}
          </p>
        </article>
      ))}
    </section>
  );
}

function LogsPanel({ data }: { data: HomeViewData }) {
  return (
    <section className="stack">
      <div className="section-title">
        <h2>記録</h2>
        <Link className="primary-action" href="/logs/new">
          追加
        </Link>
      </div>
      {data.logs.map((log) => (
        <article className="wide-card" key={log.id}>
          <p className="card-kind">{log.place}</p>
          <h3>
            <Link href={`/logs/${log.id}`}>{log.title}</Link>
          </h3>
          <p>
            {log.grade} · {log.note}
          </p>
        </article>
      ))}
    </section>
  );
}
