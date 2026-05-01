"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LogSummary, PlanSummary, PostSummary } from "@zac/shared";
import { getApi } from "./api-client";
import { CommentThread, LogConvertActions, PlanActions, PostActions } from "./detail-actions";
import { ZacIcon } from "./zac-icons";

type LoadState<T> =
  | { status: "loading"; data?: never; message?: never }
  | { status: "error"; data?: never; message: string }
  | { status: "ready"; data: T; message?: never };

export function ProtectedPlanDetail({ planId }: { planId: string }) {
  const state = useProtectedData<PlanSummary>(`/v1/session-plans/${encodeURIComponent(planId)}`);

  if (state.status !== "ready") {
    return <ProtectedDetailState state={state} />;
  }

  const plan = state.data;

  return (
    <>
      <section className="hero-card">
        <div className="hero-visual icon-visual plan-visual">
          <ZacIcon decorative icon="sessionPlan" size={76} />
        </div>
        <div>
          <p className="card-kind">予定 · {plan.visibility}</p>
          <h2>{plan.title}</h2>
          <p>{plan.place}</p>
          <p>
            {plan.time} · {plan.members}
          </p>
        </div>
      </section>
      <section className="stack">
        <PlanActions planId={plan.id} />
        <CommentThread targetId={plan.id} targetType="session_plan" />
      </section>
    </>
  );
}

export function ProtectedLogDetail({ logId }: { logId: string }) {
  const state = useProtectedData<LogSummary>(`/v1/logs/${encodeURIComponent(logId)}`);

  if (state.status !== "ready") {
    return <ProtectedDetailState state={state} />;
  }

  const log = state.data;

  return (
    <>
      <section className="hero-card">
        <div className="hero-visual icon-visual log-visual">
          <ZacIcon decorative icon="climbLog" size={76} />
        </div>
        <div>
          <p className="card-kind">{log.place}</p>
          <h2>{log.title}</h2>
          <p>{log.grade}</p>
          <p>{log.note}</p>
        </div>
      </section>
      <section className="stack">
        <LogConvertActions logId={log.id} />
      </section>
    </>
  );
}

export function ProtectedPostDetail({ postId }: { postId: string }) {
  const state = useProtectedData<PostSummary>(`/v1/posts/${encodeURIComponent(postId)}`);

  if (state.status !== "ready") {
    return <ProtectedDetailState state={state} />;
  }

  const post = state.data;

  return (
    <>
      <section className="hero-card">
        <div className="hero-visual icon-visual post-visual">
          <ZacIcon decorative icon="bouldering" size={76} />
        </div>
        <div>
          <p className="card-kind">投稿 · {post.visibility}</p>
          <h2>{post.sourceLabel}</h2>
          <p>{post.body}</p>
          <p>
            {post.authorName} · {post.sourceType}
          </p>
        </div>
      </section>
      <section className="stack">
        <PostActions postId={post.id} />
        <article className="wide-card action-row">
          <Link className="ghost-button" href={`/reports/new?targetType=post&targetId=${post.id}`}>
            通報
          </Link>
        </article>
        <CommentThread targetId={post.id} targetType="post" />
      </section>
    </>
  );
}

function ProtectedDetailState<T>({ state }: { state: LoadState<T> }) {
  return (
    <section className="wide-card">
      <p className="card-kind">{state.status === "loading" ? "Loading" : "Error"}</p>
      <h2>{state.status === "loading" ? "詳細を読み込んでいます" : "詳細を表示できません"}</h2>
      <p>{state.status === "loading" ? "ログイン状態を確認したあと、詳細を取得します。" : state.message}</p>
    </section>
  );
}

function useProtectedData<T>(path: string): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function load() {
      setState({ status: "loading" });
      const response = await getApi<T>(path);

      if (!active) {
        return;
      }

      if (!response.ok) {
        setState({ status: "error", message: response.message });
        return;
      }

      setState({ status: "ready", data: response.data });
    }

    void load();

    return () => {
      active = false;
    };
  }, [path]);

  return state;
}
