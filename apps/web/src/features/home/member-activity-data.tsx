"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { feedFixtures, logFixtures, planFixtures, postFixtures } from "@zac/shared";
import { getApi } from "./api-client";
import type { HomeFeedItem, HomeViewData, LogSummary, PlanSummary, PostSummary } from "./data";
import { ProfilePanel } from "./profile-panel";

export type MemberActivityLoadState =
  | { status: "loading"; data?: never; message?: never }
  | { status: "error"; data?: never; message: string }
  | { status: "ready"; data: HomeViewData; message?: never };

export function useMemberActivityData(baseData: HomeViewData, enabled = true): MemberActivityLoadState {
  const [state, setState] = useState<MemberActivityLoadState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function load() {
      if (!enabled) {
        setState({ status: "loading" });
        return;
      }

      setState({ status: "loading" });

      const [plans, logs, posts, feed] = await Promise.all([
        getApi<PlanSummary[]>("/v1/session-plans"),
        getApi<LogSummary[]>("/v1/logs"),
        getApi<PostSummary[]>("/v1/posts"),
        getApi<HomeFeedItem[]>("/v1/feed"),
      ]);

      if (!active) {
        return;
      }

      const failed = [plans, logs, posts, feed].find((response) => !response.ok);

      if (failed && !failed.ok) {
        if (!isLiveApiMode()) {
          setState({
            status: "ready",
            data: withMemberData(baseData, {
              plans: planFixtures,
              logs: logFixtures,
              posts: postFixtures,
              feed: feedFixtures,
            }),
          });
          return;
        }

        setState({ status: "error", message: failed.message });
        return;
      }

      setState({
        status: "ready",
        data: withMemberData(baseData, {
          plans: plans.ok ? plans.data : [],
          logs: logs.ok ? logs.data : [],
          posts: posts.ok ? posts.data : [],
          feed: feed.ok ? feed.data : [],
        }),
      });
    }

    void load();

    return () => {
      active = false;
    };
  }, [baseData, enabled]);

  return state;
}

export function MemberPlansPanel({ data }: { data: HomeViewData }) {
  return (
    <section className="stack">
      <div className="section-title">
        <h2>予定</h2>
        <Link className="primary-action" href="/plans/new">
          作成
        </Link>
      </div>
      {data.plans.length > 0 ? (
        data.plans.map((plan) => (
          <article className="wide-card" key={plan.id}>
            <p className="card-kind">{plan.time}</p>
            <h3>
              <Link href={`/plans/${plan.id}`}>{plan.title}</Link>
            </h3>
            <p>
              {plan.place} · {plan.members}
            </p>
          </article>
        ))
      ) : (
        <article className="empty-state">
          <h3>予定はまだありません</h3>
          <p>保存したジムやイベントから次のセッションを作成できます。</p>
        </article>
      )}
    </section>
  );
}

export function MemberLogsPanel({ data }: { data: HomeViewData }) {
  return (
    <section className="stack">
      <div className="section-title">
        <h2>記録</h2>
        <Link className="primary-action" href="/logs/new">
          追加
        </Link>
      </div>
      {data.logs.length > 0 ? (
        data.logs.map((log) => (
          <article className="wide-card" key={log.id}>
            <p className="card-kind">{log.place}</p>
            <h3>
              <Link href={`/logs/${log.id}`}>{log.title}</Link>
            </h3>
            <p>
              {log.grade} · {log.note}
            </p>
          </article>
        ))
      ) : (
        <article className="empty-state">
          <h3>記録はまだありません</h3>
          <p>登った内容を1分で残せます。</p>
        </article>
      )}
    </section>
  );
}

export function MemberProfilePanel({ data }: { data: HomeViewData }) {
  return <ProfilePanel data={data} />;
}

export function ActivityMetricStrip({
  authenticated,
  baseData,
  checking,
  memberState,
}: {
  authenticated: boolean;
  baseData: HomeViewData;
  checking: boolean;
  memberState: MemberActivityLoadState;
}) {
  if (checking || !authenticated) {
    return null;
  }

  const metrics = memberState.status === "ready" ? memberState.data.metrics : baseData.metrics;

  return (
    <section className="metric-strip" aria-label="Weekly summary">
      <Metric label="今週の予定" value={String(metrics.weeklyPlans)} />
      <Metric label="保存ジム" value={String(metrics.savedGyms)} />
      <Metric label="記録" value={String(metrics.logs)} />
    </section>
  );
}

export function MemberActivityState({ state }: { state: Exclude<MemberActivityLoadState, { status: "ready" }> }) {
  return (
    <section className="wide-card">
      <p className="card-kind">{state.status === "loading" ? "Loading" : "Error"}</p>
      <h2>{state.status === "loading" ? "活動データを読み込んでいます" : "活動データを表示できません"}</h2>
      <p>{state.status === "loading" ? "ログイン状態を確認したあと、予定・記録・投稿を取得します。" : state.message}</p>
    </section>
  );
}

export function useStableHomeViewData(data: HomeViewData) {
  return useMemo(() => data, [data]);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function withMemberData(
  baseData: HomeViewData,
  activity: Pick<HomeViewData, "plans" | "logs" | "posts" | "feed">,
): HomeViewData {
  return {
    ...baseData,
    ...activity,
    metrics: {
      weeklyPlans: activity.plans.length,
      savedGyms: baseData.gyms.filter((gym) => gym.saved).length,
      logs: activity.logs.length,
    },
  };
}

function isLiveApiMode() {
  return process.env.NEXT_PUBLIC_APP_ENV === "production";
}
