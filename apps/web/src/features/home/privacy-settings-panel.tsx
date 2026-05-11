"use client";

import { useEffect, useState } from "react";
import type { UserProfileSummary } from "@zac/shared";
import { getApi, patchApi } from "./api-client";
import { getBrowserSupabaseClient } from "./integration-provider";

const profileKey = "zac.local.profile";

type Visibility = "public" | "followers" | "participants" | "private";

const visibilityLabels: Record<Visibility, string> = {
  public: "全体",
  followers: "フォロワー",
  participants: "参加者",
  private: "自分のみ",
};

export function PrivacySettingsPanel() {
  const [visibility, setVisibility] = useState<Visibility>("followers");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    let active = true;
    const profile = readProfile();
    if (isVisibility(profile?.defaultVisibility)) {
      setVisibility(profile.defaultVisibility);
    }

    async function loadRemoteSettings() {
      if (!getBrowserSupabaseClient()) {
        return;
      }

      const response = await getApi<UserProfileSummary | null>("/v1/me/profile");

      if (!active || !response.ok || !response.data || !isVisibility(response.data.defaultVisibility)) {
        return;
      }

      setVisibility(response.data.defaultVisibility);
      window.localStorage.setItem(profileKey, JSON.stringify(response.data));
    }

    void loadRemoteSettings();

    return () => {
      active = false;
    };
  }, []);

  async function save() {
    if (getBrowserSupabaseClient()) {
      const response = await patchApi<UserProfileSummary | null>("/v1/me/settings", {
        defaultVisibility: visibility,
        locationEnabled: false,
      });

      if (!response.ok) {
        setSavedMessage(response.message);
        return;
      }

      if (response.data) {
        window.localStorage.setItem(profileKey, JSON.stringify(response.data));
      }

      setSavedMessage("公開範囲を保存しました。");
      return;
    }

    const profile = readProfile() ?? {};
    window.localStorage.setItem(
      profileKey,
      JSON.stringify({
        ...profile,
        defaultVisibility: visibility,
        locationEnabled: false,
      }),
    );
    setSavedMessage("公開範囲を保存しました。");
  }

  return (
    <section className="stack">
      <article className="wide-card">
        <p className="card-kind">予定・投稿の初期表示範囲</p>
        <h3>{visibilityLabels[visibility]}</h3>
        <div className="form-grid compact-form">
          <label>
            初期表示範囲
            <select onChange={(event) => setVisibility(event.target.value as Visibility)} value={visibility}>
              <option value="followers">フォロワー</option>
              <option value="public">全体</option>
              <option value="participants">参加者</option>
              <option value="private">自分のみ</option>
            </select>
          </label>
        </div>
      </article>
      <article className="wide-card settings-row">
        <div>
          <p className="card-kind">ホームジム表示</p>
          <h3>OFF</h3>
        </div>
      </article>
      <article className="wide-card settings-row">
        <div>
          <p className="card-kind">位置情報利用</p>
          <h3>OFF</h3>
        </div>
      </article>
      {savedMessage ? <p className="success-message">{savedMessage}</p> : null}
      <button className="primary-action" onClick={save} type="button">
        保存
      </button>
    </section>
  );
}

function readProfile(): Record<string, unknown> | null {
  try {
    const value = window.localStorage.getItem(profileKey);
    return value ? (JSON.parse(value) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function isVisibility(value: unknown): value is Visibility {
  return value === "public" || value === "followers" || value === "participants" || value === "private";
}
