import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "./app-shell";
import { getPlanDetailData } from "./data";
import { CommentThread, PlanActions } from "./detail-actions";
import { ZacIcon } from "./zac-icons";

export async function PlanDetail({ planId }: { planId: string }) {
  const plan = await getPlanDetailData(planId);

  if (!plan) {
    notFound();
  }

  return (
    <AppShell activeTab="plans" action={<Link className="primary-action" href="/logs/new">記録する</Link>}>
      <section className="hero-card">
        <div className="hero-visual icon-visual plan-visual">
          <ZacIcon decorative icon="sessionPlan" size={76} />
        </div>
        <div>
          <p className="card-kind">予定 · {plan.visibility}</p>
          <h2>{plan.title}</h2>
          <p>{plan.place}</p>
          <p>{plan.time} · {plan.members}</p>
        </div>
      </section>
      <section className="stack">
        <PlanActions planId={plan.id} />
        <CommentThread targetId={plan.id} targetType="session_plan" />
      </section>
    </AppShell>
  );
}
