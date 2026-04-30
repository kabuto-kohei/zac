"use client";

import { onboardingProfileSchema, type UserProfileSummary } from "@zac/shared";
import { useEffect, useState } from "react";
import { getApi, putApi } from "./api-client";
import { getBrowserSupabaseClient } from "./integration-provider";
import { SubmitButton } from "./submit-button";

const profileKey = "zac.local.profile";

type EditableProfile = Pick<UserProfileSummary, "displayName" | "discipline" | "experience" | "area" | "defaultVisibility"> & {
  interest: "partner" | "log" | "event" | "training";
};

type FieldErrors = Partial<Record<"displayName" | "area" | "form", string>>;

const defaultProfile: EditableProfile = {
  displayName: "",
  discipline: "boulder",
  experience: "beginner",
  area: "",
  interest: "partner",
  defaultVisibility: "followers",
};

export function ProfileSettingsPanel() {
  const [profile, setProfile] = useState<EditableProfile>(defaultProfile);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const localProfile = readLocalProfile();
      if (localProfile && active) {
        setProfile(localProfile);
      }

      if (!getBrowserSupabaseClient()) {
        setLoading(false);
        return;
      }

      const response = await getApi<UserProfileSummary | null>("/v1/me/profile");

      if (!active) {
        return;
      }

      if (response.ok && response.data) {
        const remoteProfile = {
          displayName: response.data.displayName,
          discipline: response.data.discipline,
          experience: response.data.experience,
          area: response.data.area,
          interest: "partner",
          defaultVisibility: response.data.defaultVisibility,
        } satisfies EditableProfile;
        window.localStorage.setItem(profileKey, JSON.stringify(remoteProfile));
        setProfile(remoteProfile);
      }

      setLoading(false);
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  async function submit(formData: FormData) {
    setMessage("");
    const result = onboardingProfileSchema.safeParse({
      displayName: formData.get("displayName")?.toString(),
      discipline: formData.get("discipline")?.toString(),
      experience: formData.get("experience")?.toString(),
      area: formData.get("area")?.toString(),
      interest: formData.get("interest")?.toString(),
      defaultVisibility: formData.get("defaultVisibility")?.toString(),
      locationEnabled: false,
    });

    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "displayName" || field === "area") {
          nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    if (getBrowserSupabaseClient()) {
      const response = await putApi<UserProfileSummary>("/v1/me/profile", result.data);
      if (!response.ok) {
        setErrors({ form: response.message });
        return;
      }
    }

    window.localStorage.setItem(profileKey, JSON.stringify(result.data));
    setProfile(result.data);
    setErrors({});
    setMessage("プロフィールを保存しました。");
  }

  return (
    <form action={submit} className="form-panel" key={`${profile.displayName}:${profile.area}:${profile.defaultVisibility}`}>
      <p className="card-kind">アカウント</p>
      <h1>プロフィール編集</h1>
      {loading ? <p>プロフィールを読み込んでいます。</p> : null}
      <div className="form-grid">
        <label>
          表示名
          <input aria-describedby={errors.displayName ? "profile-display-name-error" : undefined} defaultValue={profile.displayName} maxLength={40} name="displayName" placeholder="Climber" />
          {errors.displayName ? <span className="field-error" id="profile-display-name-error">{errors.displayName}</span> : null}
        </label>
        <label>
          メイン種目
          <select defaultValue={profile.discipline} name="discipline">
            <option value="boulder">ボルダー</option>
            <option value="lead">リード</option>
            <option value="top_rope">トップロープ</option>
          </select>
        </label>
        <label>
          経験
          <select defaultValue={profile.experience} name="experience">
            <option value="beginner">初心者</option>
            <option value="intermediate">中級者</option>
            <option value="advanced">上級者</option>
          </select>
        </label>
        <label>
          よく行くエリア
          <input aria-describedby={errors.area ? "profile-area-error" : undefined} defaultValue={profile.area} maxLength={40} name="area" placeholder="東京" />
          {errors.area ? <span className="field-error" id="profile-area-error">{errors.area}</span> : null}
        </label>
        <label>
          興味
          <select defaultValue={profile.interest} name="interest">
            <option value="partner">仲間探し</option>
            <option value="log">記録</option>
            <option value="event">イベント</option>
            <option value="training">トレーニング</option>
          </select>
        </label>
        <label>
          予定の初期表示範囲
          <select defaultValue={profile.defaultVisibility} name="defaultVisibility">
            <option value="followers">フォロワー</option>
            <option value="public">全体</option>
            <option value="participants">参加者</option>
            <option value="private">自分のみ</option>
          </select>
        </label>
      </div>
      <SubmitButton pendingLabel="保存中">保存</SubmitButton>
      {message ? <p className="success-message">{message}</p> : null}
      {errors.form ? <p className="field-error">{errors.form}</p> : null}
    </form>
  );
}

function readLocalProfile() {
  const raw = window.localStorage.getItem(profileKey);

  if (!raw) {
    return null;
  }

  try {
    return { ...defaultProfile, ...JSON.parse(raw) } as EditableProfile;
  } catch {
    return null;
  }
}
