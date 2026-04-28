import Link from "next/link";
import type { GymSummary, LogSummary, PlanSummary, PostSummary } from "./mock-data";

export function GymCard({ gym }: { gym: GymSummary }) {
  return (
    <article className="content-card">
      <div className="card-visual gym-visual" />
      <div>
        <p className="card-kind">{gym.area}</p>
        <h3>
          <Link href={`/gyms/${gym.id}`}>{gym.name}</Link>
        </h3>
        <p>{gym.disciplines}</p>
      </div>
      <button className="ghost-button">{gym.saved ? "保存済み" : "保存"}</button>
    </article>
  );
}

export function PlanCard({ plan }: { plan: PlanSummary }) {
  return (
    <article className="content-card">
      <div className="card-visual plan-visual" />
      <div>
        <p className="card-kind">予定 · {plan.visibility}</p>
        <h3>
          <Link href={`/plans/${plan.id}`}>{plan.title}</Link>
        </h3>
        <p>
          {plan.place} · {plan.time} · {plan.members}
        </p>
      </div>
    </article>
  );
}

export function LogCard({ log }: { log: LogSummary }) {
  return (
    <article className="content-card">
      <div className="card-visual log-visual" />
      <div>
        <p className="card-kind">記録</p>
        <h3>
          <Link href={`/logs/${log.id}`}>{log.title}</Link>
        </h3>
        <p>
          {log.place} · {log.grade}
        </p>
      </div>
    </article>
  );
}

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="content-card">
      <div className="card-visual post-visual" />
      <div>
        <p className="card-kind">投稿 · {post.visibility}</p>
        <h3>
          <Link href={`/posts/${post.id}`}>{post.sourceLabel}</Link>
        </h3>
        <p>{post.body}</p>
      </div>
    </article>
  );
}
