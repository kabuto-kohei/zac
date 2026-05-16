"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserProfileSummary } from "@zac/shared";
import { localProfileKey, signOutCurrentUser } from "./auth-session";
import { getApi } from "./api-client";
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

export function ProfilePanel() {
  const router = useRouter();
  const [profile, setProfile] = useState<LocalProfile | null>(null);

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
            <p>V1 ではログイン後に掲載情報の更新申請を送信できます。</p>
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
        <V1AccountActions />
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
            {experienceLabels[profile.experience]} · 更新申請に利用するアカウント
          </p>
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
      <V1AccountActions />
    </section>
  );
}

function V1AccountActions() {
  return (
    <section className="profile-dashboard">
      <div className="section-title">
        <h2>V1でできること</h2>
      </div>
      <div className="mini-list">
        <Link className="mini-list-item" href="/reports/new?targetType=gym">
          <span>ジム</span>
          <strong>ジム情報の更新申請</strong>
        </Link>
        <Link className="mini-list-item" href="/reports/new?targetType=event">
          <span>イベント</span>
          <strong>イベント情報の更新申請</strong>
        </Link>
        <Link className="mini-list-item" href="/explore">
          <span>閲覧</span>
          <strong>掲載ジムを確認</strong>
        </Link>
      </div>
    </section>
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
