import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "./app-shell";
import { getGymDetailData } from "./data";
import { GymActions } from "./detail-actions";
import { ZacIcon } from "./zac-icons";

export async function GymDetail({ gymId }: { gymId: string }) {
  const { gym } = await getGymDetailData(gymId);

  if (!gym) {
    notFound();
  }

  return (
    <AppShell activeTab="explore" action={<Link className="primary-action" href="/plans/new">予定作成</Link>}>
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
        <article className="empty-state">
          <h3>予定はログイン後に使えます</h3>
          <p>このジムを保存し、次のセッションを作成できます。</p>
        </article>
      </section>
    </AppShell>
  );
}
