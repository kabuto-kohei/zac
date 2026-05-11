import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "./app-shell";
import { getGymDetailData } from "./data";
import { DetailBackButton } from "./detail-back-button";
import { GymActions } from "./detail-actions";

export async function GymDetail({ gymId }: { gymId: string }) {
  const { gym } = await getGymDetailData(gymId);

  if (!gym) {
    notFound();
  }

  return (
    <AppShell activeTab="explore" action={<Link className="primary-action" href="/plans/new">予定作成</Link>}>
      <div className="detail-back-row">
        <DetailBackButton />
      </div>
      <section className="hero-card no-visual-hero">
        <div>
          <p className="card-kind">{gym.area}</p>
          <h2>{gym.name}</h2>
          <p>{gym.address}</p>
          <p>{gym.disciplines} · {gym.openingHours}</p>
          {gym.sourceUrl ? (
            <p className="source-line">
              <span>情報源</span>
              <a href={gym.sourceUrl} rel="noreferrer" target="_blank">
                {gym.sourceAttribution ?? "公式情報"}
              </a>
              {gym.instagramUrl ? (
                <a href={gym.instagramUrl} rel="noreferrer" target="_blank">
                  Instagram
                </a>
              ) : null}
              {gym.sourceVerifiedAt ? <span>{gym.sourceVerifiedAt}</span> : null}
            </p>
          ) : null}
        </div>
      </section>

      <section className="stack">
        <GymActions gymId={gym.id} initiallySaved={gym.saved} />
        <article className="empty-state">
          <h3>予定はログイン後に使えます</h3>
          <p>このジムを保存し、次のセッションを作成できます。</p>
        </article>
      </section>
    </AppShell>
  );
}
