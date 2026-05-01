"use client";

import { createSessionPlanSchema } from "@zac/shared";
import Link from "next/link";
import { useState } from "react";
import { postApi } from "./api-client";
import { AppShell } from "./app-shell";
import { AuthGate } from "./auth-gate";
import type { GymOption } from "./data";
import { SubmitButton } from "./submit-button";
import { ZacIcon } from "./zac-icons";

type FieldErrors = Partial<Record<"title" | "placeName" | "startAt" | "endAt", string>>;

export function SessionPlanForm({ gyms }: { gyms: GymOption[] }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [savedMessage, setSavedMessage] = useState("");
  const [createdPlanHref, setCreatedPlanHref] = useState("");

  async function submit(formData: FormData) {
    setSavedMessage("");
    setCreatedPlanHref("");
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
      const response = await postApi<{ id: string }>("/v1/session-plans", result.data);
      setSavedMessage(response.ok ? "予定を保存しました。" : response.message);
      setCreatedPlanHref(response.ok ? `/plans/${response.data.id}` : "");
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
      <AuthGate action="予定作成はログイン後に保存できます">
        <form action={submit} className="form-panel">
        <div className="form-heading">
          <ZacIcon decorative icon="sessionPlan" size={48} />
          <div>
            <p className="card-kind">予定作成</p>
            <h2>次に登る予定</h2>
          </div>
        </div>
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
        {savedMessage ? (
          <div className="success-panel">
            <p className="success-message">{savedMessage}</p>
            <div className="action-row">
              {createdPlanHref ? (
                <Link className="ghost-button" href={createdPlanHref}>
                  作成した予定
                </Link>
              ) : null}
              <Link className="ghost-button" href="/plans">
                予定を見る
              </Link>
              <Link className="ghost-button" href="/logs/new">
                記録を作る
              </Link>
            </div>
          </div>
        ) : null}
        <SubmitButton pendingLabel="保存中">保存</SubmitButton>
        </form>
      </AuthGate>
    </AppShell>
  );
}
