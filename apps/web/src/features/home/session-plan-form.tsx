"use client";

import { createSessionPlanSchema } from "@zac/shared";
import { useState } from "react";
import { AppShell } from "./app-shell";
import type { getGymOptions } from "./data";

type FieldErrors = Partial<Record<"title" | "placeName" | "startAt" | "endAt", string>>;
type GymOption = ReturnType<typeof getGymOptions>[number];

export function SessionPlanForm({ gyms }: { gyms: GymOption[] }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [savedMessage, setSavedMessage] = useState("");

  function validate(formData: FormData) {
    setSavedMessage("");
    const startAt = formData.get("startAt")?.toString();
    const endAt = formData.get("endAt")?.toString();
    const result = createSessionPlanSchema.safeParse({
      title: formData.get("title")?.toString(),
      placeName: formData.get("placeName")?.toString(),
      startAt: startAt ? new Date(startAt).toISOString() : "",
      endAt: endAt ? new Date(endAt).toISOString() : "",
      visibility: formData.get("visibility")?.toString(),
      joinPolicy: "open",
      note: formData.get("note")?.toString(),
    });

    if (result.success) {
      setErrors({});
      setSavedMessage("入力内容は保存可能です。API接続後に作成処理へつなぎます。");
      return;
    }

    const nextErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field === "title" || field === "placeName" || field === "startAt" || field === "endAt") {
        nextErrors[field] = issue.message;
      }
    }
    setErrors(nextErrors);
  }

  return (
    <AppShell activeTab="plans">
      <form action={validate} className="form-panel">
        <p className="card-kind">予定作成</p>
        <h2>次に登る予定</h2>
        <div className="form-grid">
          <label>
            タイトル
            <input aria-describedby={errors.title ? "plan-title-error" : undefined} maxLength={80} name="title" placeholder="火曜夜にB-PUMPで登る" />
            {errors.title ? <span className="field-error" id="plan-title-error">{errors.title}</span> : null}
          </label>
          <label>
            ジム
            <select aria-describedby={errors.placeName ? "plan-place-error" : undefined} defaultValue="" name="placeName">
              <option value="" disabled>
                選択してください
              </option>
              {gyms.map((gym) => (
                <option key={gym.id} value={gym.name}>
                  {gym.name}
                </option>
              ))}
            </select>
            {errors.placeName ? <span className="field-error" id="plan-place-error">{errors.placeName}</span> : null}
          </label>
          <label>
            開始日時
            <input aria-describedby={errors.startAt ? "plan-start-error" : undefined} name="startAt" type="datetime-local" />
            {errors.startAt ? <span className="field-error" id="plan-start-error">{errors.startAt}</span> : null}
          </label>
          <label>
            終了日時
            <input aria-describedby={errors.endAt ? "plan-end-error" : undefined} name="endAt" type="datetime-local" />
            {errors.endAt ? <span className="field-error" id="plan-end-error">{errors.endAt}</span> : null}
          </label>
          <label>
            公開範囲
            <select defaultValue="followers" name="visibility">
              <option value="followers">フォロワー</option>
              <option value="public">全体公開</option>
              <option value="participants">参加者</option>
              <option value="private">自分のみ</option>
            </select>
          </label>
          <label>
            メモ
            <textarea maxLength={1000} name="note" placeholder="軽めに登ります" />
          </label>
        </div>
        {savedMessage ? <p className="success-message">{savedMessage}</p> : null}
        <button className="primary-action" type="submit">
          保存
        </button>
      </form>
    </AppShell>
  );
}
