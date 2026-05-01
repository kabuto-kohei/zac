"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { UserProfileSummary } from "@zac/shared";
import { localProfileKey, signOutCurrentUser } from "./auth-session";
import { getApi } from "./api-client";
import type { HomeViewData } from "./data";
import { getBrowserSupabaseClient } from "./integration-provider";
import { ZacIcon } from "./zac-icons";

type LocalProfile = Pick<UserProfileSummary, "displayName" | "discipline" | "experience" | "area" | "defaultVisibility">;

const disciplineLabels: Record<LocalProfile["discipline"], string> = {
  boulder: "ボルダー",
  lead: "リード",
  top_rope: "トップロープ",
};

const experienceLabels: Record<LocalProfile["experience"], string> = {
  beginner: "初心者",
  intermediate: "中級者",
  advanced: "上級者",
};

export function ProfilePanel({ data }: { data: HomeViewData }) {
  const router = useRouter();
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [selectedTab, setSelectedTab] = useState<"plans" | "gyms" | "logs" | "posts">("plans");
  const [localStateVersion, setLocalStateVersion] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const value = window.localStorage.getItem(localProfileKey);
      const localProfile = value ? parseProfile(value) : null;
      setProfile(localProfile);

      if (!getBrowserSupabaseClient()) {
        return;
      }

      const response = await getApi<UserProfileSummary | null>("/v1/me/profile");

      if (!active || !response.ok || !response.data) {
        return;
      }

      const remoteProfile: LocalProfile = {
        displayName: response.data.displayName,
        discipline: response.data.discipline,
        experience: response.data.experience,
        area: response.data.area,
        defaultVisibility: response.data.defaultVisibility,
      };

      window.localStorage.setItem(localProfileKey, JSON.stringify(remoteProfile));
      setProfile(remoteProfile);
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onStorage = () => setLocalStateVersion((current) => current + 1);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const activity = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        joinedPlans: data.plans,
        savedGyms: data.gyms.filter((gym) => gym.saved),
        recentLogs: data.logs,
        savedPosts: [],
      };
    }

    const joinedPlans = data.plans.filter((plan) => window.localStorage.getItem(`zac.plan.joined.${plan.id}`) === "true");
    const savedGyms = data.gyms.filter((gym) => gym.saved || window.localStorage.getItem(`zac.gym.saved.${gym.id}`) === "true");
    const savedPosts = data.posts.filter((post) => window.localStorage.getItem(`zac.post.saved.${post.id}`) === "true");

    return {
      joinedPlans: joinedPlans.length > 0 ? joinedPlans : data.plans.slice(0, 2),
      savedGyms: savedGyms.length > 0 ? savedGyms : data.gyms.slice(0, 2),
      recentLogs: data.logs.slice(0, 3),
      savedPosts,
    };
  }, [data.gyms, data.logs, data.plans, data.posts, localStateVersion]);

  async function logout() {
    await signOutCurrentUser();
    router.push("/login");
    router.refresh();
  }

  if (!profile) {
    return (
      <section className="stack">
        <div className="profile-panel">
          <div className="avatar">
            <ZacIcon decorative icon="logo" size={54} />
          </div>
          <div>
            <p className="card-kind">ゲスト閲覧中</p>
            <h2>ログインするとマイページを使えます</h2>
            <p>保存したジム、参加予定、記録、投稿をひとつの場所で管理できます。</p>
            <div className="action-row">
              <Link className="primary-action" href="/register">
                新規登録
              </Link>
              <Link className="ghost-button" href="/login">
                ログイン
              </Link>
            </div>
          </div>
        </div>
        <ProfileActivity activity={activity} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      </section>
    );
  }

  return (
    <section className="stack">
      <div className="profile-panel">
        <div className="avatar">
          <ZacIcon decorative icon={profile.discipline === "lead" ? "lead" : profile.discipline === "top_rope" ? "topRope" : "bouldering"} size={54} />
        </div>
        <div>
          <p className="card-kind">
            {disciplineLabels[profile.discipline]} · {profile.area}
          </p>
          <h2>{profile.displayName}</h2>
          <p>
            {experienceLabels[profile.experience]} · 初期公開範囲 {profile.defaultVisibility}
          </p>
          <div className="profile-stats" aria-label="活動サマリー">
            <span>
              <strong>{activity.joinedPlans.length}</strong>
              参加予定
            </span>
            <span>
              <strong>{activity.recentLogs.length}</strong>
              記録
            </span>
            <span>
              <strong>{activity.savedGyms.length}</strong>
              保存ジム
            </span>
          </div>
          <div className="action-row">
            <Link className="ghost-button" href="/settings">
              設定
            </Link>
            <button className="ghost-button" onClick={logout} type="button">
              ログアウト
            </button>
          </div>
        </div>
      </div>
      <ProfileActivity activity={activity} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
    </section>
  );
}

function ProfileActivity({
  activity,
  selectedTab,
  setSelectedTab,
}: {
  activity: {
    joinedPlans: HomeViewData["plans"];
    savedGyms: HomeViewData["gyms"];
    recentLogs: HomeViewData["logs"];
    savedPosts: HomeViewData["posts"];
  };
  selectedTab: "plans" | "gyms" | "logs" | "posts";
  setSelectedTab: (tab: "plans" | "gyms" | "logs" | "posts") => void;
}) {
  const tabLabels = [
    { value: "plans" as const, label: "予定", count: activity.joinedPlans.length },
    { value: "gyms" as const, label: "ジム", count: activity.savedGyms.length },
    { value: "logs" as const, label: "記録", count: activity.recentLogs.length },
    { value: "posts" as const, label: "保存", count: activity.savedPosts.length },
  ];

  return (
    <section className="profile-dashboard">
      <div className="section-title">
        <h2>アクティビティ</h2>
        <Link className="ghost-button" href="/logs/new">
          記録する
        </Link>
      </div>
      <div className="activity-tabs" aria-label="アクティビティ切り替え">
        {tabLabels.map((tab) => (
          <button
            aria-pressed={selectedTab === tab.value}
            className={selectedTab === tab.value ? "activity-tab is-active" : "activity-tab"}
            key={tab.value}
            onClick={() => setSelectedTab(tab.value)}
            type="button"
          >
            <span>{tab.label}</span>
            <strong>{tab.count}</strong>
          </button>
        ))}
      </div>
      {selectedTab === "plans" ? <MiniList emptyText="参加中の予定はまだありません。" items={activity.joinedPlans.map((plan) => ({ href: `/plans/${plan.id}`, meta: plan.time, title: plan.title }))} /> : null}
      {selectedTab === "gyms" ? <MiniList emptyText="保存したジムはまだありません。" items={activity.savedGyms.map((gym) => ({ href: `/gyms/${gym.id}`, meta: gym.area, title: gym.name }))} /> : null}
      {selectedTab === "logs" ? <MiniList emptyText="記録はまだありません。" items={activity.recentLogs.map((log) => ({ href: `/logs/${log.id}`, meta: log.grade, title: log.title }))} /> : null}
      {selectedTab === "posts" ? <MiniList emptyText="保存した投稿はまだありません。" items={activity.savedPosts.map((post) => ({ href: `/posts/${post.id}`, meta: post.visibility, title: post.sourceLabel }))} /> : null}
    </section>
  );
}

function MiniList({
  emptyText,
  items,
}: {
  emptyText: string;
  items: Array<{ href: string; meta: string; title: string }>;
}) {
  if (items.length === 0) {
    return <p className="mini-empty">{emptyText}</p>;
  }

  return (
    <div className="mini-list">
      {items.map((item) => (
        <Link className="mini-list-item" href={item.href} key={item.href}>
          <span>{item.meta}</span>
          <strong>{item.title}</strong>
        </Link>
      ))}
    </div>
  );
}

function parseProfile(value: string): LocalProfile | null {
  try {
    const parsed = JSON.parse(value) as Partial<LocalProfile>;
    if (!parsed.displayName || !parsed.discipline || !parsed.experience || !parsed.area) {
      return null;
    }

    return {
      displayName: parsed.displayName,
      discipline: parsed.discipline,
      experience: parsed.experience,
      area: parsed.area,
      defaultVisibility: parsed.defaultVisibility ?? "followers",
    };
  } catch {
    return null;
  }
}
