import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, MetricStrip } from "./app-shell";
import { getGymDetailData } from "./data";
import { GymActions } from "./detail-actions";
import { ZacIcon } from "./zac-icons";

export async function GymDetail({ gymId }: { gymId: string }) {
  const { gym, relatedPlans } = await getGymDetailData(gymId);

  if (!gym) {
    notFound();
  }

  return (
    <AppShell activeTab="explore" action={<Link className="primary-action" href="/plans/new">予定作成</Link>}>
      <MetricStrip />
      <section className="hero-card">
        <div className="hero-visual icon-visual gym-visual">
          <ZacIcon decorative icon="gym" size={76} />
        </div>
        <div>
          <p className="card-kind">{gym.area}</p>
          <h2>{gym.name}</h2>
          <p>{gym.address}</p>
          <p>{gym.disciplines} · {gym.openingHours}</p>
        </div>
      </section>

      <section className="stack">
        <GymActions gymId={gym.id} initiallySaved={gym.saved} />
        <div className="section-title">
          <h2>関連予定</h2>
          <span>{relatedPlans.length}件</span>
        </div>
        {relatedPlans.length > 0 ? (
          relatedPlans.map((plan) => (
            <article className="wide-card" key={plan.id}>
              <p className="card-kind">{plan.time}</p>
              <h3>{plan.title}</h3>
              <p>{plan.members}</p>
            </article>
          ))
        ) : (
          <article className="empty-state">
            <h3>まだ予定はありません</h3>
            <p>このジムで次のセッションを作成できます。</p>
          </article>
        )}
      </section>
    </AppShell>
  );
}
