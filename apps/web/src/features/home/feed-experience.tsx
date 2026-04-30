"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuthStatus } from "./auth-state";
import { EventCard, GymCard, LogCard, PlanCard, PostCard } from "./cards";
import type { HomeFeedItem, HomeViewData } from "./data";
import { ZacIcon } from "./zac-icons";

type FeedFilter = "all" | HomeFeedItem["type"];

const filterLabels: Array<{ value: FeedFilter; label: string }> = [
  { value: "all", label: "すべて" },
  { value: "session_plan", label: "予定" },
  { value: "climbing_log", label: "記録" },
  { value: "post", label: "投稿" },
];

const topicLabels = ["#仕事後", "#初級歓迎", "#ボルダー", "#リード", "#遠征", "#セッション募集"];

export function FeedExperience({ data }: { data: HomeViewData }) {
  const [filter, setFilter] = useState<FeedFilter>("all");
  const filteredFeed = useMemo(() => {
    if (filter === "all") {
      return data.feed;
    }

    return data.feed.filter((entry) => entry.type === filter);
  }, [data.feed, filter]);

  const nextPlan = data.plans[0];
  const highlightedGym = data.gyms[0];
  const nextEvent = data.events[0];
  const feedCounts = {
    all: data.feed.length,
    session_plan: data.feed.filter((entry) => entry.type === "session_plan").length,
    climbing_log: data.feed.filter((entry) => entry.type === "climbing_log").length,
    post: data.feed.filter((entry) => entry.type === "post").length,
  };

  return (
    <section className="stack">
      <GuestValueBanner />
      <QuickComposer />
      <HomeShortcutGrid nextPlan={nextPlan} highlightedGym={highlightedGym} nextEvent={nextEvent} />
      <div className="topic-rail" aria-label="トピック">
        {topicLabels.map((topic) => (
          <button className="topic-chip" key={topic} type="button">
            {topic}
          </button>
        ))}
      </div>
      <section className="digest-card" aria-label="今日のピックアップ">
        <div>
          <p className="card-kind">TODAY</p>
          <h2>今日の動き</h2>
          <p>
            {nextPlan ? `${nextPlan.place}で${nextPlan.title}があります。` : "参加できる予定を探しましょう。"}
            {nextEvent ? ` ${nextEvent.title}もチェックできます。` : ""}
          </p>
        </div>
        <div className="digest-actions">
          {nextPlan ? (
            <Link className="ghost-button" href={`/plans/${nextPlan.id}`}>
              予定を見る
            </Link>
          ) : null}
          {highlightedGym ? (
            <Link className="ghost-button" href={`/gyms/${highlightedGym.id}`}>
              ジムを見る
            </Link>
          ) : null}
        </div>
      </section>
      <div className="section-title">
        <div>
          <p className="section-kicker">Feed</p>
          <h2>公開フィード</h2>
        </div>
        <Link className="primary-action" href="/posts/new">
          投稿
        </Link>
      </div>
      <div className="feed-tabs" aria-label="フィード切り替え">
        {filterLabels.map((item) => (
          <button
            aria-pressed={filter === item.value}
            className={filter === item.value ? "feed-tab is-active" : "feed-tab"}
            key={item.value}
            onClick={() => setFilter(item.value)}
            type="button"
          >
            {item.label}
            <span>{feedCounts[item.value]}</span>
          </button>
        ))}
      </div>
      {filteredFeed.length > 0 ? (
        filteredFeed.map((entry) => <FeedCard entry={entry} key={`${entry.type}-${entry.item.id}`} />)
      ) : (
        <div className="empty-state">
          <h3>表示できるフィードがありません</h3>
          <p>別のタブに切り替えるか、新しい投稿・予定・記録を追加してください。</p>
        </div>
      )}
    </section>
  );
}

function HomeShortcutGrid({
  nextPlan,
  highlightedGym,
  nextEvent,
}: {
  nextPlan: HomeViewData["plans"][number] | undefined;
  highlightedGym: HomeViewData["gyms"][number] | undefined;
  nextEvent: HomeViewData["events"][number] | undefined;
}) {
  const shortcuts = [
    nextPlan
      ? {
          href: `/plans/${nextPlan.id}`,
          kicker: "Next plan",
          title: nextPlan.title,
          detail: `${nextPlan.place} · ${nextPlan.time}`,
        }
      : {
          href: "/plans",
          kicker: "Next plan",
          title: "予定を探す",
          detail: "参加できる公開予定を見る",
        },
    nextEvent
      ? {
          href: `/events/${nextEvent.id}`,
          kicker: "Event",
          title: nextEvent.title,
          detail: `${nextEvent.gymName} · ${nextEvent.startsAt}`,
        }
      : {
          href: "/explore",
          kicker: "Event",
          title: "イベントを探す",
          detail: "講習やセッションを見る",
        },
    highlightedGym
      ? {
          href: `/gyms/${highlightedGym.id}`,
          kicker: "Gym",
          title: highlightedGym.name,
          detail: `${highlightedGym.area} · ${highlightedGym.disciplines}`,
        }
      : {
          href: "/explore",
          kicker: "Gym",
          title: "ジムを探す",
          detail: "エリアと種目から探す",
        },
  ];

  return (
    <section className="home-shortcuts" aria-label="ホームショートカット">
      {shortcuts.map((shortcut) => (
        <Link className="home-shortcut" href={shortcut.href} key={shortcut.kicker}>
          <span>{shortcut.kicker}</span>
          <strong>{shortcut.title}</strong>
          <small>{shortcut.detail}</small>
        </Link>
      ))}
    </section>
  );
}

function QuickComposer() {
  const { authenticated, checking } = useAuthStatus();

  if (!checking && !authenticated) {
    return (
      <section className="composer-card guest-composer" aria-label="ログイン">
        <div className="composer-avatar">
          <ZacIcon decorative icon="logo" size={38} />
        </div>
        <div className="composer-main">
          <p className="composer-input">保存、参加、作成はログイン後に使えます</p>
          <div className="composer-actions">
            <Link href="/login">ログイン</Link>
            <Link href="/register">新規登録</Link>
            <Link href="/explore">探す</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="composer-card" aria-label="作成">
      <div className="composer-avatar">
        <ZacIcon decorative icon="logo" size={38} />
      </div>
      <div className="composer-main">
        <Link className="composer-input" href="/posts/new">
          今日の登りを共有する
        </Link>
        <div className="composer-actions">
          <Link href="/logs/new">
            <ZacIcon decorative icon="climbLog" size={20} />
            記録
          </Link>
          <Link href="/plans/new">
            <ZacIcon decorative icon="sessionPlan" size={20} />
            予定
          </Link>
          <Link href="/posts/new">
            <ZacIcon decorative icon="bouldering" size={20} />
            投稿
          </Link>
        </div>
      </div>
    </section>
  );
}

function GuestValueBanner() {
  const { authenticated, checking } = useAuthStatus();

  if (checking || authenticated) {
    return null;
  }

  return (
    <section className="guest-banner">
      <div>
        <p className="card-kind">Guest mode</p>
        <h2>公開情報はこのまま閲覧できます</h2>
        <p>ジム、イベント、公開予定、投稿を見てから、保存や参加が必要になったタイミングでログインできます。</p>
      </div>
      <div className="action-row">
        <Link className="primary-action" href="/register">
          保存を始める
        </Link>
        <Link className="ghost-button" href="/login">
          ログイン
        </Link>
      </div>
    </section>
  );
}

function FeedCard({ entry }: { entry: HomeFeedItem }) {
  if (entry.type === "session_plan") {
    return <PlanCard plan={entry.item} />;
  }

  if (entry.type === "climbing_log") {
    return <LogCard log={entry.item} />;
  }

  return <PostCard post={entry.item} />;
}
