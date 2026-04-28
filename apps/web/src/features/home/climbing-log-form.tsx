"use client";

import { createClimbingLogSchema } from "@zac/shared";
import { useState } from "react";
import { postApi } from "./api-client";
import { AppShell } from "./app-shell";
import type { getGymOptions } from "./data";

type FieldErrors = Partial<Record<"climbedOn" | "placeName", string>>;
type GymOption = ReturnType<typeof getGymOptions>[number];

export function ClimbingLogForm({ gyms }: { gyms: GymOption[] }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [savedMessage, setSavedMessage] = useState("");

  async function submit(formData: FormData) {
    setSavedMessage("");
    const result = createClimbingLogSchema.safeParse({
      climbedOn: formData.get("climbedOn")?.toString(),
      placeName: formData.get("placeName")?.toString(),
      gradeText: formData.get("gradeText")?.toString(),
      summary: formData.get("summary")?.toString(),
      note: formData.get("note")?.toString(),
      visibility: "private",
    });

    if (result.success) {
      setErrors({});
      const response = await postApi<{ id: string }>("/v1/logs", result.data);
      setSavedMessage(response.ok ? "記録を保存しました。" : response.message);
      return;
    }

    const nextErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field === "climbedOn" || field === "placeName") {
        nextErrors[field] = issue.message;
      }
    }
    setErrors(nextErrors);
  }

  return (
    <AppShell activeTab="logs">
      <form action={submit} className="form-panel">
        <p className="card-kind">記録作成</p>
        <h2>登った内容を残す</h2>
        <div className="form-grid">
          <label>
            日付
            <input aria-describedby={errors.climbedOn ? "log-date-error" : undefined} name="climbedOn" type="date" />
            {errors.climbedOn ? <span className="field-error" id="log-date-error">{errors.climbedOn}</span> : null}
          </label>
          <label>
            ジム
            <select aria-describedby={errors.placeName ? "log-place-error" : undefined} defaultValue="" name="placeName">
              <option value="" disabled>
                選択してください
              </option>
              {gyms.map((gym) => (
                <option key={gym.id} value={gym.name}>
                  {gym.name}
                </option>
              ))}
            </select>
            {errors.placeName ? <span className="field-error" id="log-place-error">{errors.placeName}</span> : null}
          </label>
          <label>
            グレード
            <input maxLength={50} name="gradeText" placeholder="4級 / 5.10a" />
          </label>
          <label>
            概要
            <input maxLength={140} name="summary" placeholder="垂壁の黄色を完登" />
          </label>
          <label>
            メモ
            <textarea maxLength={2000} name="note" placeholder="足位置、ムーブ、次回試したいこと" />
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
