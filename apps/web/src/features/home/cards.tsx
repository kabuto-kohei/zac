"use client";

import Link from "next/link";
import type { EventSummary, GymSummary, LogSummary, PlanSummary, PostSummary } from "./data";
import { deleteApi, postApi } from "./api-client";
import { useLocalToggle } from "./local-toggle";
import { ZacIcon, type ZacIconKey } from "./zac-icons";

export function GymCard({ gym }: { gym: GymSummary }) {
  const [saved, toggleSaved] = useLocalToggle(`zac.gym.saved.${gym.id}`, gym.saved);

  async function submitSave() {
    const response = saved ? await deleteApi<{ saved: boolean }>(`/v1/gyms/${gym.id}/save`) : await postApi<{ saved: boolean }>(`/v1/gyms/${gym.id}/save`, {});
    if (response.ok) {
      toggleSaved();
    }
  }

  return (
    <article className="content-card">
      <IconVisual className="gym-visual" icon="gym" />
      <div>
        <p className="card-kind">{gym.area}</p>
        <h3>
          <Link href={`/gyms/${gym.id}`}>{gym.name}</Link>
        </h3>
        <p>{gym.disciplines}</p>
      </div>
      <button className={saved ? "ghost-button is-active" : "ghost-button"} onClick={submitSave} type="button">
        {saved ? "保存済み" : "保存"}
      </button>
    </article>
  );
}

export function EventCard({ event }: { event: EventSummary }) {
  return (
    <article className="content-card">
      <IconVisual className="event-visual" icon="lead" />
      <div>
        <p className="card-kind">{event.gymName}</p>
        <h3>
          <Link href={`/events/${event.id}`}>{event.title}</Link>
        </h3>
        <p>
          {event.startsAt} · {event.capacity}
        </p>
      </div>
      <Link className="ghost-button" href={`/events/${event.id}`}>
        詳細
      </Link>
    </article>
  );
}

export function PlanCard({ plan }: { plan: PlanSummary }) {
  const [joined, toggleJoined] = useLocalToggle(`zac.plan.joined.${plan.id}`);

  async function submitJoin() {
    const response = joined ? await deleteApi<{ joined: boolean }>(`/v1/session-plans/${plan.id}/join`) : await postApi<{ joined: boolean }>(`/v1/session-plans/${plan.id}/join`, {});
    if (response.ok) {
      toggleJoined();
    }
  }

  return (
    <article className="content-card">
      <IconVisual className="plan-visual" icon="sessionPlan" />
      <div>
        <p className="card-kind">予定 · {plan.visibility}</p>
        <h3>
          <Link href={`/plans/${plan.id}`}>{plan.title}</Link>
        </h3>
        <p>
          {plan.place} · {plan.time} · {plan.members}
        </p>
      </div>
      <button className={joined ? "ghost-button is-active" : "ghost-button"} onClick={submitJoin} type="button">
        {joined ? "参加中" : "参加"}
      </button>
    </article>
  );
}

export function LogCard({ log }: { log: LogSummary }) {
  return (
    <article className="content-card">
      <IconVisual className="log-visual" icon="climbLog" />
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
  const [liked, toggleLiked] = useLocalToggle(`zac.post.liked.${post.id}`);

  async function submitLike() {
    const response = liked ? await deleteApi<{ liked: boolean }>(`/v1/posts/${post.id}/like`) : await postApi<{ liked: boolean }>(`/v1/posts/${post.id}/like`, {});
    if (response.ok) {
      toggleLiked();
    }
  }

  return (
    <article className="content-card">
      <IconVisual className="post-visual" icon="bouldering" />
      <div>
        <p className="card-kind">投稿 · {post.visibility}</p>
        <h3>
          <Link href={`/posts/${post.id}`}>{post.sourceLabel}</Link>
        </h3>
        <p>{post.body}</p>
      </div>
      <button className={liked ? "ghost-button is-active" : "ghost-button"} onClick={submitLike} type="button">
        {liked ? "いいね済み" : "いいね"}
      </button>
    </article>
  );
}

function IconVisual({
  className,
  icon,
}: {
  className: string;
  icon: ZacIconKey;
}) {
  return (
    <div className={`card-visual icon-visual ${className}`}>
      <ZacIcon decorative icon={icon} size={52} />
    </div>
  );
}
