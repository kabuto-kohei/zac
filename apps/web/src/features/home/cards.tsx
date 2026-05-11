"use client";

import Link from "next/link";
import { useState } from "react";
import type { EventSummary, GymSummary, LogSummary, PlanSummary, PostSummary } from "./data";
import { deleteApi, postApi } from "./api-client";
import { useAuthStatus } from "./auth-state";
import { useLocalToggle } from "./local-toggle";
import { ZacIcon, type ZacIconKey } from "./zac-icons";

export function GymCard({ gym }: { gym: GymSummary }) {
  const [saved, toggleSaved] = useLocalToggle(`zac.gym.saved.${gym.id}`, gym.saved);
  const { authenticated, checking } = useAuthStatus();
  const [message, setMessage] = useState("");

  async function submitSave() {
    if (!checking && !authenticated) {
      setMessage("ログインするとジムを保存できます。");
      return;
    }

    const response = saved ? await deleteApi<{ saved: boolean }>(`/v1/gyms/${gym.id}/save`) : await postApi<{ saved: boolean }>(`/v1/gyms/${gym.id}/save`, {});
    if (response.ok) {
      toggleSaved();
      setMessage(response.data.saved ? "保存しました。" : "保存を解除しました。");
      return;
    }

    setMessage(response.message);
  }

  return (
    <article className="content-card gym-card no-visual-card">
      <div>
        <p className="card-kind">{gym.area}</p>
        <h3>
          <Link href={`/gyms/${gym.id}`}>{gym.name}</Link>
        </h3>
        <div className="card-meta-row">
          <span>{gym.disciplines}</span>
        </div>
        <button className={saved ? "ghost-button is-active" : "ghost-button"} onClick={submitSave} type="button">
          {saved ? "保存済み" : "保存"}
        </button>
      </div>
      {message ? <CardMessage message={message} /> : null}
    </article>
  );
}

export function EventCard({ event }: { event: EventSummary }) {
  return (
    <article className="content-card no-visual-card">
      <div>
        <p className="card-kind">{event.gymName}</p>
        <p className={`event-kind event-kind-${getEventDisplayGroup(event)}`}>{getEventDisplayLabel(event)}</p>
        <h3>
          <Link href={`/events/${event.id}`}>{event.title}</Link>
        </h3>
        <div className="card-meta-row">
          <span>{event.startsAt}</span>
          <span>{event.capacity}</span>
        </div>
      </div>
      <Link className="ghost-button" href={`/events/${event.id}`}>
        詳細
      </Link>
    </article>
  );
}

function getEventDisplayGroup(event: EventSummary) {
  if (event.category === "competition") {
    return "competition";
  }

  if (event.category === "route_set") {
    return "route-set";
  }

  if (event.category === "private_booking") {
    return "private-booking";
  }

  if (event.category === "opening_change" || event.category === "construction" || event.category === "notice") {
    return "opening-change";
  }

  return "event";
}

function getEventDisplayLabel(event: EventSummary) {
  const group = getEventDisplayGroup(event);
  if (group === "competition") {
    return "コンペ";
  }
  if (group === "route-set") {
    return "セット";
  }
  if (group === "private-booking") {
    return "貸切";
  }
  if (group === "opening-change") {
    return "営業時間変更";
  }
  return "イベント";
}

export function PlanCard({ plan }: { plan: PlanSummary }) {
  const [joined, toggleJoined] = useLocalToggle(`zac.plan.joined.${plan.id}`);
  const { authenticated, checking } = useAuthStatus();
  const [message, setMessage] = useState("");

  async function submitJoin() {
    if (!checking && !authenticated) {
      setMessage("ログインすると予定に参加できます。");
      return;
    }

    const response = joined ? await deleteApi<{ joined: boolean }>(`/v1/session-plans/${plan.id}/join`) : await postApi<{ joined: boolean }>(`/v1/session-plans/${plan.id}/join`, {});
    if (response.ok) {
      toggleJoined();
      setMessage(response.data.joined ? "参加しました。" : "参加をキャンセルしました。");
      return;
    }

    setMessage(response.message);
  }

  return (
    <article className="content-card">
      <IconVisual className="plan-visual" icon="sessionPlan" />
      <div>
        <p className="card-kind">予定 · {plan.visibility}</p>
        <h3>
          <Link href={`/plans/${plan.id}`}>{plan.title}</Link>
        </h3>
        <div className="card-meta-row">
          <span>{plan.place}</span>
          <span>{plan.time}</span>
          <span>{plan.members}</span>
        </div>
      </div>
      <button className={joined ? "ghost-button is-active" : "ghost-button"} onClick={submitJoin} type="button">
        {joined ? "参加中" : "参加"}
      </button>
      {message ? <CardMessage message={message} /> : null}
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
        <div className="card-meta-row">
          <span>{log.place}</span>
          <span>{log.grade}</span>
        </div>
      </div>
    </article>
  );
}

export function PostCard({ post }: { post: PostSummary }) {
  const [liked, toggleLiked] = useLocalToggle(`zac.post.liked.${post.id}`);
  const { authenticated, checking } = useAuthStatus();
  const [message, setMessage] = useState("");

  async function submitLike() {
    if (!checking && !authenticated) {
      setMessage("ログインすると投稿にリアクションできます。");
      return;
    }

    const response = liked ? await deleteApi<{ liked: boolean }>(`/v1/posts/${post.id}/like`) : await postApi<{ liked: boolean }>(`/v1/posts/${post.id}/like`, {});
    if (response.ok) {
      toggleLiked();
      setMessage(response.data.liked ? "いいねしました。" : "いいねを解除しました。");
      return;
    }

    setMessage(response.message);
  }

  return (
    <article className="content-card">
      <IconVisual className="post-visual" icon="bouldering" />
      <div>
        <p className="card-kind">投稿 · {post.visibility}</p>
        <h3>
          <Link href={`/posts/${post.id}`}>{post.sourceLabel}</Link>
        </h3>
        <p className="card-body">{post.body}</p>
      </div>
      <button className={liked ? "ghost-button is-active" : "ghost-button"} onClick={submitLike} type="button">
        {liked ? "いいね済み" : "いいね"}
      </button>
      {message ? <CardMessage message={message} /> : null}
    </article>
  );
}

function CardMessage({ message }: { message: string }) {
  const needsLogin = message.startsWith("ログインすると");

  return (
    <p className="card-message">
      {message} {needsLogin ? <Link href="/login">ログイン</Link> : null}
    </p>
  );
}

function IconVisual({ icon, className }: { icon: ZacIconKey; className?: string }) {
  return (
    <div className={className ? `card-visual ${className}` : "card-visual"}>
      <ZacIcon decorative icon={icon} size={24} />
    </div>
  );
}
