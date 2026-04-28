import Link from "next/link";
import { AppShell, MetricStripView, type Tab } from "./app-shell";
import { EventCard, GymCard, LogCard, PlanCard, PostCard } from "./cards";
import { getHomeViewData, type HomeViewData } from "./data";

export function WebAppHome({ activeTab }: { activeTab: Tab }) {
  const data = getHomeViewData(activeTab);

  return (
    <AppShell activeTab={activeTab}>
      <MetricStripView {...data.metrics} />
      {activeTab === "explore" ? <ExplorePanel data={data} /> : null}
      {activeTab === "plans" ? <PlansPanel data={data} /> : null}
      {activeTab === "logs" ? <LogsPanel data={data} /> : null}
      {activeTab === "me" ? <ProfilePanel /> : null}
      {activeTab === "home" ? <HomeFeed data={data} /> : null}
    </AppShell>
  );
}

function HomeFeed({ data }: { data: HomeViewData }) {
  return (
    <section className="stack">
      <div className="section-title">
        <h2>フィード</h2>
        <Link className="primary-action" href="/posts/new">
          投稿
        </Link>
      </div>
      {data.feed.map((entry) => (
        <FeedCard entry={entry} key={`${entry.type}-${entry.item.id}`} />
      ))}
    </section>
  );
}

function FeedCard({ entry }: { entry: HomeViewData["feed"][number] }) {
  if (entry.type === "session_plan") {
    return <PlanCard plan={entry.item} />;
  }

  if (entry.type === "climbing_log") {
    return <LogCard log={entry.item} />;
  }

  return <PostCard post={entry.item} />;
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

function ProfilePanel() {
  return (
    <section className="profile-panel">
      <div className="avatar" />
      <div>
        <p className="card-kind">ボルダー · 東京</p>
        <h2>Climber</h2>
        <p>よく行くジム、予定、記録をここに集約する。</p>
        <Link className="ghost-button" href="/settings">
          設定
        </Link>
      </div>
    </section>
  );
}
