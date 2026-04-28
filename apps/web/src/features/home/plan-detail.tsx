import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "./app-shell";
import { findPlanFixture } from "@zac/shared";

export function PlanDetail({ planId }: { planId: string }) {
  const plan = findPlanFixture(planId);

  if (!plan) {
    notFound();
  }

  return (
    <AppShell activeTab="plans" action={<Link className="primary-action" href="/logs/new">記録する</Link>}>
      <section className="hero-card">
        <div className="hero-visual plan-visual" />
        <div>
          <p className="card-kind">予定 · {plan.visibility}</p>
          <h2>{plan.title}</h2>
          <p>{plan.place}</p>
          <p>{plan.time} · {plan.members}</p>
        </div>
      </section>
      <section className="stack">
        <article className="wide-card">
          <p className="card-kind">参加</p>
          <h3>参加状態</h3>
          <p>API接続後に参加/キャンセル、コメント、完了処理を接続します。</p>
        </article>
        <article className="wide-card">
          <p className="card-kind">コメント</p>
          <h3>まだコメントはありません</h3>
          <p>コメントは対象リソースの公開範囲を継承します。</p>
        </article>
      </section>
    </AppShell>
  );
}

