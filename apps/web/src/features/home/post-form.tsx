"use client";

import { createPostSchema } from "@zac/shared";
import { useState } from "react";
import { postApi } from "./api-client";
import { AppShell } from "./app-shell";

type FieldErrors = Partial<Record<"body", string>>;

export function PostForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [savedMessage, setSavedMessage] = useState("");

  async function submit(formData: FormData) {
    setSavedMessage("");
    const result = createPostSchema.safeParse({
      body: formData.get("body")?.toString(),
      visibility: formData.get("visibility")?.toString(),
    });

    if (result.success) {
      setErrors({});
      const response = await postApi<{ id: string }>("/v1/posts", result.data);
      setSavedMessage(response.ok ? "投稿しました。" : response.message);
      return;
    }

    const nextErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      if (issue.path[0] === "body") {
        nextErrors.body = issue.message;
      }
    }
    setErrors(nextErrors);
  }

  return (
    <AppShell activeTab="home">
      <form action={submit} className="form-panel">
        <p className="card-kind">投稿作成</p>
        <h2>登ったことを共有する</h2>
        <div className="form-grid">
          <label>
            本文
            <textarea aria-describedby={errors.body ? "post-body-error" : undefined} maxLength={500} name="body" placeholder="今日のセッション、気づき、募集したいこと" />
            {errors.body ? <span className="field-error" id="post-body-error">{errors.body}</span> : null}
          </label>
          <label>
            表示範囲
            <select defaultValue="followers" name="visibility">
              <option value="followers">フォロワー</option>
              <option value="public">全体</option>
              <option value="participants">参加者</option>
              <option value="private">自分のみ</option>
            </select>
          </label>
        </div>
        {savedMessage ? <p className="success-message">{savedMessage}</p> : null}
        <button className="primary-action" type="submit">
          投稿
        </button>
      </form>
    </AppShell>
  );
}
