import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "./app-shell";
import { getGymDetailData } from "./data";
import { DetailBackButton } from "./detail-back-button";

export async function GymDetail({ gymId }: { gymId: string }) {
  const { gym } = await getGymDetailData(gymId);

  if (!gym) {
    notFound();
  }

  return (
    <AppShell activeTab="explore" action={<Link className="primary-action" href={`/reports/new?targetType=gym&targetId=${gym.id}`}>更新申請</Link>}>
      <div className="detail-back-row">
        <DetailBackButton fallbackHref="/explore" />
      </div>
      <section className="hero-card no-visual-hero">
        <div>
          <p className="card-kind">{gym.area}</p>
          <h2>{gym.name}</h2>
          <p>{gym.address}</p>
          <p>{gym.disciplines} · {gym.openingHours}</p>
          {gym.sourceUrl || gym.websiteUrl || gym.instagramUrl ? (
            <div className="source-list" aria-label="情報源">
              {gym.websiteUrl || gym.sourceUrl ? (
                <p className="source-line">
                  <span>{gym.websiteUrl ? "公式サイト" : "情報源"}</span>
                  <a href={gym.websiteUrl ?? gym.sourceUrl} rel="noreferrer" target="_blank">
                    {gym.sourceAttribution ?? "公式情報"}
                  </a>
                </p>
              ) : null}
              {gym.instagramUrl ? (
                <p className="source-line">
                  <span>SNS</span>
                  <a href={gym.instagramUrl} rel="noreferrer" target="_blank">
                    Instagram{gym.instagramHandle ? ` @${gym.instagramHandle}` : ""}
                  </a>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="stack">
        <article className="empty-state">
          <h3>掲載内容の修正を申請できます</h3>
          <p>住所、営業状態、種目、公式リンク、SNS の誤りはログイン後に運営へ送信できます。</p>
          <div className="action-row">
            <Link className="primary-action" href={`/reports/new?targetType=gym&targetId=${gym.id}`}>
              更新申請
            </Link>
            {gym.websiteUrl || gym.sourceUrl ? (
              <a className="ghost-button" href={gym.websiteUrl ?? gym.sourceUrl} rel="noreferrer" target="_blank">
                公式情報
              </a>
            ) : null}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
