import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, MetricStrip } from "./app-shell";
import { getEventDetailData } from "./data";
import { EventActions } from "./detail-actions";
import { ZacIcon } from "./zac-icons";

export async function EventDetail({ eventId }: { eventId: string }) {
  const event = await getEventDetailData(eventId);

  if (!event) {
    notFound();
  }

  return (
    <AppShell activeTab="explore" action={<Link className="primary-action" href="/plans/new">予定作成</Link>}>
      <MetricStrip />
      <section className="hero-card">
        <div className="hero-visual icon-visual event-visual">
          <ZacIcon decorative icon="lead" size={76} />
        </div>
        <div>
          <p className="card-kind">{event.gymName}</p>
          <h2>{event.title}</h2>
          <p>
            {event.startsAt} - {event.endsAt}
          </p>
          <p>
            定員 {event.capacity} · {event.status === "scheduled" ? "開催予定" : "受付終了"}
          </p>
          {event.description ? <p>{event.description}</p> : null}
        </div>
      </section>

      <section className="stack">
        <EventActions eventId={event.id} />
      </section>
    </AppShell>
  );
}
