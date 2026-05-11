import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "./app-shell";
import { getEventDetailData } from "./data";
import { DetailBackButton } from "./detail-back-button";
import { EventActions } from "./detail-actions";

export async function EventDetail({ eventId }: { eventId: string }) {
  const event = await getEventDetailData(eventId);

  if (!event) {
    notFound();
  }

  return (
    <AppShell activeTab="explore" action={<Link className="primary-action" href="/plans/new">予定作成</Link>}>
      <div className="detail-back-row">
        <DetailBackButton />
      </div>
      <section className="hero-card no-visual-hero">
        <div>
          <p className="card-kind">{event.gymName}</p>
          <h2>{event.title}</h2>
          <p>
            {event.startsAt} - {event.endsAt}
          </p>
          {event.description ? <p>{event.description}</p> : null}
          {event.sourceUrl ? (
            <p className="source-line">
              <span>情報源</span>
              <a href={event.sourceUrl} rel="noreferrer" target="_blank">
                {event.sourceLabel}
              </a>
              {event.sourceQuote ? <span>{event.sourceQuote}</span> : null}
            </p>
          ) : null}
        </div>
      </section>

      <section className="stack">
        <EventActions eventId={event.id} />
      </section>
    </AppShell>
  );
}
