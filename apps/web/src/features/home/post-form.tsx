"use client";

import { createPostSchema } from "@zac/shared";
import Link from "next/link";
import { useState } from "react";
import { postApi } from "./api-client";
import { AppShell } from "./app-shell";
import { AuthRequiredNote } from "./auth-required-note";
import { ImageAttachmentField, uploadSelectedImages } from "./image-attachment-field";
import { SubmitButton } from "./submit-button";
import { ZacIcon } from "./zac-icons";

type FieldErrors = Partial<Record<"body", string>>;

export function PostForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [savedMessage, setSavedMessage] = useState("");
  const [createdPostHref, setCreatedPostHref] = useState("");

  async function submit(formData: FormData) {
    setSavedMessage("");
    setCreatedPostHref("");
    const result = createPostSchema.safeParse({
      body: formData.get("body")?.toString(),
      visibility: formData.get("visibility")?.toString(),
    });

    if (result.success) {
      setErrors({});
      const response = await postApi<{ id: string }>("/v1/posts", result.data);
      if (!response.ok) {
        setSavedMessage(response.message);
        setCreatedPostHref("");
        return;
      }

      const uploadResult = await uploadSelectedImages("post", response.data.id, formData);
      setSavedMessage(uploadResult.ok && uploadResult.message ? `投稿しました。${uploadResult.message}` : uploadResult.ok ? "投稿しました。" : `投稿しました。${uploadResult.message}`);
      setCreatedPostHref(`/posts/${response.data.id}`);
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
        <div className="form-heading">
          <ZacIcon decorative icon="bouldering" size={48} />
          <div>
            <p className="card-kind">投稿作成</p>
            <h2>登ったことを共有する</h2>
          </div>
        </div>
        <AuthRequiredNote action="投稿作成はログイン後に公開できます" />
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
          <ImageAttachmentField />
        </div>
        {savedMessage ? (
          <div className="success-panel">
            <p className="success-message">{savedMessage}</p>
            <div className="action-row">
              {createdPostHref ? (
                <Link className="ghost-button" href={createdPostHref}>
                  作成した投稿
                </Link>
              ) : null}
              <Link className="ghost-button" href="/home">
                フィードへ
              </Link>
              <Link className="ghost-button" href="/plans/new">
                予定を作る
              </Link>
            </div>
          </div>
        ) : null}
        <SubmitButton pendingLabel="投稿中">投稿</SubmitButton>
      </form>
    </AppShell>
  );
}
