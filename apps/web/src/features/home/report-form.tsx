"use client";

import { createReportSchema } from "@zac/shared";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "./app-shell";
import { AuthGate } from "./auth-gate";
import { postApi } from "./api-client";
import { SubmitButton } from "./submit-button";

type FieldErrors = Partial<Record<"targetId" | "category", string>>;

export function ReportForm({
  initialTargetId = "",
  initialTargetType = "post",
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
      setSavedMessage(response.ok ? "通報を運営キューへ送信しました。" : response.message);
      return;
    }

    const nextErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field === "targetId" || field === "category") {
        nextErrors[field] = issue.message;
      }
    }
    setErrors(nextErrors);
  }

  return (
    <AppShell activeTab="home">
      <AuthGate action="通報はログイン後に送信できます">
        <form action={submit} className="form-panel">
        <p className="card-kind">通報</p>
        <h2>運営に知らせる</h2>
        <div className="form-grid">
          <label>
            対象
            <input aria-describedby={errors.targetId ? "report-target-error" : undefined} defaultValue={initialTargetId} maxLength={120} name="targetId" />
            {errors.targetId ? <span className="field-error" id="report-target-error">{errors.targetId}</span> : null}
          </label>
          <label>
            対象種別
            <select defaultValue={initialTargetType} name="targetType">
              <option value="post">投稿</option>
              <option value="comment">コメント</option>
              <option value="session_plan">予定</option>
              <option value="climbing_log">記録</option>
              <option value="user">ユーザー</option>
            </select>
          </label>
          <label>
            カテゴリ
            <select aria-describedby={errors.category ? "report-category-error" : undefined} defaultValue="spam" name="category">
              <option value="harassment">ハラスメント</option>
              <option value="spam">スパム</option>
              <option value="inappropriate_image">不適切画像</option>
              <option value="dangerous_behavior">危険行為の助長</option>
              <option value="personal_information">個人情報の晒し</option>
              <option value="copyright">著作権侵害</option>
              <option value="impersonation">なりすまし</option>
              <option value="other">その他</option>
            </select>
            {errors.category ? <span className="field-error" id="report-category-error">{errors.category}</span> : null}
          </label>
          <label>
            補足
            <textarea maxLength={1000} name="note" placeholder="確認してほしい内容" />
          </label>
        </div>
        {savedMessage ? (
          <div className="success-panel">
            <p className="success-message">{savedMessage}</p>
            <div className="action-row">
              <Link className="ghost-button" href="/">
                フィードへ戻る
              </Link>
            </div>
          </div>
        ) : null}
        <SubmitButton pendingLabel="送信中">確認</SubmitButton>
        </form>
      </AuthGate>
    </AppShell>
  );
}
