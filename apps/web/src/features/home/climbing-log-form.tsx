"use client";

import { createClimbingLogSchema } from "@zac/shared";
import Link from "next/link";
import { useState } from "react";
import { postApi } from "./api-client";
import { AppShell } from "./app-shell";
import { AuthRequiredNote } from "./auth-required-note";
import type { GymOption } from "./data";
import { ImageAttachmentField, uploadSelectedImages } from "./image-attachment-field";
import { SubmitButton } from "./submit-button";
import { ZacIcon } from "./zac-icons";

type FieldErrors = Partial<Record<"climbedOn" | "placeName", string>>;

export function ClimbingLogForm({ gyms }: { gyms: GymOption[] }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [savedMessage, setSavedMessage] = useState("");
  const [createdLogHref, setCreatedLogHref] = useState("");

  async function submit(formData: FormData) {
    setSavedMessage("");
    setCreatedLogHref("");
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
      if (!response.ok) {
        setSavedMessage(response.message);
        setCreatedLogHref("");
        return;
      }

      const uploadResult = await uploadSelectedImages("climbing_log", response.data.id, formData);
      setSavedMessage(uploadResult.ok && uploadResult.message ? `記録を保存しました。${uploadResult.message}` : uploadResult.ok ? "記録を保存しました。" : `記録を保存しました。${uploadResult.message}`);
      setCreatedLogHref(`/logs/${response.data.id}`);
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
        <div className="form-heading">
          <ZacIcon decorative icon="climbLog" size={48} />
          <div>
            <p className="card-kind">記録作成</p>
            <h2>登った内容を残す</h2>
          </div>
        </div>
        <AuthRequiredNote action="記録作成はログイン後に保存できます" />
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
          <ImageAttachmentField />
        </div>
        {savedMessage ? (
          <div className="success-panel">
            <p className="success-message">{savedMessage}</p>
            <div className="action-row">
              {createdLogHref ? (
                <Link className="ghost-button" href={createdLogHref}>
                  作成した記録
                </Link>
              ) : null}
              <Link className="ghost-button" href="/logs">
                記録を見る
              </Link>
              <Link className="ghost-button" href="/posts/new">
                投稿する
              </Link>
              <Link className="ghost-button" href="/plans/new">
                次回予定
              </Link>
            </div>
          </div>
        ) : null}
        <SubmitButton pendingLabel="保存中">保存</SubmitButton>
      </form>
    </AppShell>
  );
}
