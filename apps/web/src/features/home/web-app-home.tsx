import Link from "next/link";
import { AppShell, MetricStripView, type Tab } from "./app-shell";
import { EventCard, GymCard } from "./cards";
import { getHomeViewData, type HomeViewData } from "./data";
import { FeedExperience } from "./feed-experience";
import { ProfilePanel } from "./profile-panel";

export async function WebAppHome({ activeTab }: { activeTab: Tab }) {
  const data = await getHomeViewData(activeTab);

  return (
    <AppShell activeTab={activeTab}>
      <MetricStripView {...data.metrics} />
      {activeTab === "explore" ? <ExplorePanel data={data} /> : null}
      {activeTab === "plans" ? <PlansPanel data={data} /> : null}
      {activeTab === "logs" ? <LogsPanel data={data} /> : null}
      {activeTab === "me" ? <ProfilePanel data={data} /> : null}
      {activeTab === "home" ? <FeedExperience data={data} /> : null}
    </AppShell>
  );
}

function ExplorePanel({ data }: { data: HomeViewData }) {
  return (
    <section className="stack">
      <label className="search-box">
        <span>ジム・イベント検索</span>
        <input placeholder="エリア、ジム名、種目" />
      </label>
      <div className="section-title">
        <h2>イベント</h2>
        <span>{data.events.length}件</span>
      </div>
      {data.events.map((event) => (
        <EventCard event={event} key={event.id} />
      ))}
      <div className="section-title">
        <h2>ジム</h2>
        <span>{data.gyms.length}件</span>
      </div>
      {data.gyms.map((gym) => (
        <GymCard gym={gym} key={gym.id} />
      ))}
    </section>
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
