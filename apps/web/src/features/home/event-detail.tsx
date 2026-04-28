import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, MetricStrip } from "./app-shell";
import { getEventDetailData } from "./data";

export async function EventDetail({ eventId }: { eventId: string }) {
  const event = await getEventDetailData(eventId);

  if (!event) {
    notFound();
  }

  return (
    <AppShell activeTab="explore" action={<Link className="primary-action" href="/plans/new">予定作成</Link>}>
      <MetricStrip />
      <section className="hero-card">
        <div className="hero-visual event-visual" />
        <div>
          <p className="card-kind">{event.gymName}</p>
          <h2>{event.title}</h2>
          <p>
            {event.startsAt} - {event.endsAt}
          </p>
          <p>
            定員 {event.capacity} · {event.status === "scheduled" ? "開催予定" : "受付終了"}
          </p>
        </div>
      </section>

      <section className="stack">
        <article className="wide-card">
          <p className="card-kind">イベント</p>
          <h3>このイベントを起点に予定を作る</h3>
          <p>参加管理は後続の認証・権限実装後に接続します。MVPでは予定作成から行動へつなげます。</p>
        </article>
      </section>
    </AppShell>
  );
}
