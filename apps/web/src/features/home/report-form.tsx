"use client";

import { createReportSchema } from "@zac/shared";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "./app-shell";
import { AuthGate } from "./auth-gate";
import { postApi } from "./api-client";
import { SubmitButton } from "./submit-button";

type FieldErrors = Partial<Record<"targetId" | "category" | "note", string>>;

export function ReportForm({
  initialTargetId = "",
  initialTargetType = "gym",
}: {
  initialTargetId?: string;
  initialTargetType?: string;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [savedMessage, setSavedMessage] = useState("");

  async function submit(formData: FormData) {
    setSavedMessage("");
    const result = createReportSchema.safeParse({
      targetType: formData.get("targetType")?.toString(),
      targetId: formData.get("targetId")?.toString(),
      category: formData.get("category")?.toString(),
      note: formData.get("note")?.toString(),
    });

    if (result.success) {
      setErrors({});
      const response = await postApi<{ id: string }>("/v1/reports", result.data);
      setSavedMessage(response.ok ? "更新申請を運営キューへ送信しました。" : response.message);
      return;
    }

    const nextErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field === "targetId" || field === "category" || field === "note") {
        nextErrors[field] = issue.message;
      }
    }
    setErrors(nextErrors);
  }

  return (
    <AppShell activeTab="home">
      <AuthGate action="情報更新申請はログイン後に送信できます">
        <form action={submit} className="form-panel">
        <p className="card-kind">情報更新申請</p>
        <h2>掲載情報の修正を申請する</h2>
        <div className="form-grid">
          <label>
            対象ID
            <input aria-describedby={errors.targetId ? "report-target-error" : undefined} defaultValue={initialTargetId} maxLength={120} name="targetId" />
            {errors.targetId ? <span className="field-error" id="report-target-error">{errors.targetId}</span> : null}
          </label>
          <label>
            対象種別
            <select defaultValue={initialTargetType} name="targetType">
              <option value="gym">ジム</option>
              <option value="event">イベント</option>
            </select>
          </label>
          <label>
            申請内容
            <select aria-describedby={errors.category ? "report-category-error" : undefined} defaultValue={initialTargetType === "event" ? "event_info_update" : "gym_info_update"} name="category">
              <option value="gym_info_update">ジム情報の修正</option>
              <option value="event_info_update">イベント情報の修正</option>
              <option value="new_event_request">新規イベント掲載</option>
              <option value="closure_or_relocation">閉店・移転・長期休業</option>
              <option value="source_link_update">公式リンク・SNS の修正</option>
              <option value="other">その他</option>
            </select>
            {errors.category ? <span className="field-error" id="report-category-error">{errors.category}</span> : null}
          </label>
          <label>
            申請理由・参考URL
            <textarea
              aria-describedby={errors.note ? "report-note-error" : undefined}
              maxLength={1000}
              name="note"
              placeholder="例: 公式サイトでは5/30にセット替えと案内されています。URL: https://..."
            />
            {errors.note ? <span className="field-error" id="report-note-error">{errors.note}</span> : null}
          </label>
        </div>
        {savedMessage ? (
          <div className="success-panel">
            <p className="success-message">{savedMessage}</p>
            <div className="action-row">
              <Link className="ghost-button" href="/">
                カレンダーへ戻る
              </Link>
            </div>
          </div>
        ) : null}
        <SubmitButton pendingLabel="送信中">申請を送信</SubmitButton>
        </form>
      </AuthGate>
    </AppShell>
  );
}
