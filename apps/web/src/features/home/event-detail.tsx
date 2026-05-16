import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "./app-shell";
import { getEventDetailData } from "./data";
import { DetailBackButton } from "./detail-back-button";

export async function EventDetail({ eventId }: { eventId: string }) {
  const event = await getEventDetailData(eventId);

  if (!event) {
    notFound();
  }

  return (
    <AppShell activeTab="home" action={<Link className="primary-action" href={`/reports/new?targetType=event&targetId=${event.id}`}>更新申請</Link>}>
      <div className="detail-back-row">
        <DetailBackButton fallbackHref="/" />
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
        <article className="empty-state">
          <h3>掲載内容の修正を申請できます</h3>
          <p>日程、種別、公式リンク、説明の誤りはログイン後に運営へ送信できます。</p>
          <div className="action-row">
            <Link className="primary-action" href={`/reports/new?targetType=event&targetId=${event.id}`}>
              更新申請
            </Link>
            {event.sourceUrl ? (
              <a className="ghost-button" href={event.sourceUrl} rel="noreferrer" target="_blank">
                公式情報
              </a>
            ) : null}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
