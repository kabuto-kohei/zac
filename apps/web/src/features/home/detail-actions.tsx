"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { deleteApi, getApi, postApi } from "./api-client";
import { useLocalToggle } from "./local-toggle";

type Comment = {
  id: string;
  body: string;
  authorName?: string;
  createdAt?: string;
};

export function PlanActions({ planId }: { planId: string }) {
  const [joined, toggleJoined] = useLocalToggle(`zac.plan.joined.${planId}`);
  const [completed, toggleCompleted] = useLocalToggle(`zac.plan.completed.${planId}`);
  const [createdLogHref, setCreatedLogHref] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitJoin() {
    startTransition(async () => {
      const response = joined ? await deleteApi<{ joined: boolean }>(`/v1/session-plans/${planId}/join`) : await postApi<{ joined: boolean }>(`/v1/session-plans/${planId}/join`, {});
      if (response.ok) {
        toggleJoined();
        setMessage(response.data.joined ? "参加状態を保存しました。" : "参加をキャンセルしました。");
      } else {
        setMessage(response.message);
      }
    });
  }

  function submitComplete() {
    startTransition(async () => {
      const response = await postApi<{ completed: boolean }>(`/v1/session-plans/${planId}/complete`, {});
      if (response.ok) {
        if (!completed) {
          toggleCompleted();
        }
        setMessage("予定を完了にしました。");
      } else {
        setMessage(response.message);
      }
    });
  }

  function convertToLog() {
    startTransition(async () => {
      const response = await postApi<{ id: string }>(`/v1/session-plans/${planId}/convert-to-log`, {});
      if (response.ok) {
        if (!completed) {
          toggleCompleted();
        }
        setCreatedLogHref(`/logs/${response.data.id}`);
        setMessage("予定から記録を作成しました。");
      } else {
        setMessage(response.message);
      }
    });
  }

  return (
    <article className="wide-card">
      <p className="card-kind">参加</p>
      <h3>{joined ? "参加中" : "未参加"}</h3>
      <p>{completed ? "この予定は完了済みです。記録作成へ進めます。" : "参加状態と完了状態を保存できます。"}</p>
      <div className="action-row">
        <button className={joined ? "ghost-button is-active" : "primary-action"} disabled={isPending} onClick={submitJoin} type="button">
          {joined ? "参加キャンセル" : "参加する"}
        </button>
        <button className={completed ? "ghost-button is-active" : "ghost-button"} disabled={isPending} onClick={submitComplete} type="button">
          {completed ? "完了済み" : "完了にする"}
        </button>
        {createdLogHref ? (
          <Link className="primary-action" href={createdLogHref}>
            記録を見る
          </Link>
        ) : (
          <button className="ghost-button" disabled={isPending} onClick={convertToLog} type="button">
            記録にする
          </button>
        )}
      </div>
      {message ? <p className="field-help">{message}</p> : null}
    </article>
  );
}

export function PostActions({ postId }: { postId: string }) {
  const [liked, toggleLiked] = useLocalToggle(`zac.post.liked.${postId}`);
  const [saved, toggleSaved] = useLocalToggle(`zac.post.saved.${postId}`);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitLike() {
    startTransition(async () => {
      const response = liked ? await deleteApi<{ liked: boolean }>(`/v1/posts/${postId}/like`) : await postApi<{ liked: boolean }>(`/v1/posts/${postId}/like`, {});
      if (response.ok) {
        toggleLiked();
        setMessage(response.data.liked ? "いいねしました。" : "いいねを解除しました。");
      } else {
        setMessage(response.message);
      }
    });
  }

  function submitSave() {
    startTransition(async () => {
      const response = saved ? await deleteApi<{ saved: boolean }>(`/v1/posts/${postId}/save`) : await postApi<{ saved: boolean }>(`/v1/posts/${postId}/save`, {});
      if (response.ok) {
        toggleSaved();
        setMessage(response.data.saved ? "投稿を保存しました。" : "保存を解除しました。");
      } else {
        setMessage(response.message);
      }
    });
  }

  return (
    <article className="wide-card">
      <p className="card-kind">リアクション</p>
      <h3>{liked ? "いいね済み" : "リアクションする"}</h3>
      <p>いいねと保存をフィード整理に使えます。</p>
      <div className="action-row">
        <button className={liked ? "ghost-button is-active" : "ghost-button"} disabled={isPending} onClick={submitLike} type="button">
          {liked ? "いいね済み" : "いいね"}
        </button>
        <button className={saved ? "ghost-button is-active" : "ghost-button"} disabled={isPending} onClick={submitSave} type="button">
          {saved ? "保存済み" : "保存"}
        </button>
      </div>
      {message ? <p className="field-help">{message}</p> : null}
    </article>
  );
}

export function GymActions({ gymId, initiallySaved }: { gymId: string; initiallySaved: boolean }) {
  const [saved, toggleSaved] = useLocalToggle(`zac.gym.saved.${gymId}`, initiallySaved);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitSave() {
    startTransition(async () => {
      const response = saved ? await deleteApi<{ saved: boolean }>(`/v1/gyms/${gymId}/save`) : await postApi<{ saved: boolean }>(`/v1/gyms/${gymId}/save`, {});
      if (response.ok) {
        toggleSaved();
        setMessage(response.data.saved ? "ジムを保存しました。" : "保存を解除しました。");
      } else {
        setMessage(response.message);
      }
    });
  }

  return (
    <article className="wide-card">
      <p className="card-kind">ジム</p>
      <h3>{saved ? "保存済み" : "保存して予定に使う"}</h3>
      <p>保存ジムは予定作成や記録作成の候補に使います。</p>
      <div className="action-row">
        <button className={saved ? "ghost-button is-active" : "primary-action"} disabled={isPending} onClick={submitSave} type="button">
          {saved ? "保存解除" : "保存"}
        </button>
      </div>
      {message ? <p className="field-help">{message}</p> : null}
    </article>
  );
}

export function EventActions({ eventId }: { eventId: string }) {
  const [interested, toggleInterested] = useLocalToggle(`zac.event.interested.${eventId}`);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitInterest() {
    startTransition(async () => {
      const response = interested ? await deleteApi<{ saved: boolean }>(`/v1/events/${eventId}/save`) : await postApi<{ saved: boolean }>(`/v1/events/${eventId}/save`, {});
      if (response.ok) {
        toggleInterested();
        setMessage(response.data.saved ? "イベントを保存しました。" : "保存を解除しました。");
      } else {
        setMessage(response.message);
      }
    });
  }

  return (
    <article className="wide-card">
      <p className="card-kind">イベント</p>
      <h3>{interested ? "興味あり" : "このイベントを検討する"}</h3>
      <p>気になるイベントを保存して、あとから予定作成へつなげます。</p>
      <div className="action-row">
        <button className={interested ? "ghost-button is-active" : "ghost-button"} disabled={isPending} onClick={submitInterest} type="button">
          {interested ? "興味あり" : "興味あり"}
        </button>
      </div>
      {message ? <p className="field-help">{message}</p> : null}
    </article>
  );
}

export function LogConvertActions({ logId }: { logId: string }) {
  const [createdPostHref, setCreatedPostHref] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function convertToPost() {
    startTransition(async () => {
      const response = await postApi<{ id: string }>(`/v1/logs/${logId}/convert-to-post`, {});
      if (response.ok) {
        setCreatedPostHref(`/posts/${response.data.id}`);
        setMessage("記録から投稿を作成しました。");
      } else {
        setMessage(response.message);
      }
    });
  }

  return (
    <article className="wide-card">
      <p className="card-kind">投稿</p>
      <h3>記録から投稿へ</h3>
      <p>登った内容を共有し、次の予定へつなげます。</p>
      <div className="action-row">
        {createdPostHref ? (
          <Link className="primary-action" href={createdPostHref}>
            投稿を見る
          </Link>
        ) : (
          <button className="primary-action" disabled={isPending} onClick={convertToPost} type="button">
            投稿にする
          </button>
        )}
        <Link className="ghost-button" href="/plans/new">
          次回予定
        </Link>
      </div>
      {message ? <p className="field-help">{message}</p> : null}
    </article>
  );
}

export function CommentThread({
  initialComments = [],
  targetId,
  targetType,
}: {
  initialComments?: Comment[];
  targetId: string;
  targetType: "post" | "session_plan";
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    getApi<Comment[]>(getCommentPath(targetType, targetId)).then((response) => {
      if (active && response.ok) {
        setComments(response.data);
      }
    });
    return () => {
      active = false;
    };
  }, [targetId, targetType]);

  function submit(formData: FormData) {
    const body = formData.get("comment")?.toString().trim();
    if (!body) {
      return;
    }

    startTransition(async () => {
      const response = await postApi<Comment>(getCommentPath(targetType, targetId), { body });
      if (response.ok) {
        setComments((current) => [response.data, ...current]);
        setMessage("");
      } else {
        setMessage(response.message);
      }
    });
  }

  return (
    <article className="wide-card comment-panel">
      <p className="card-kind">コメント</p>
      <h3>{comments.length > 0 ? `${comments.length}件のコメント` : "まだコメントはありません"}</h3>
      <form action={submit} className="inline-form">
        <label>
          コメント
          <input maxLength={300} name="comment" placeholder="参加相談や感想を書く" />
        </label>
        <button className="primary-action" disabled={isPending} type="submit">
          送信
        </button>
      </form>
      {message ? <p className="field-help">{message}</p> : null}
      <div className="comment-list">
        {comments.map((comment) => (
          <p className="comment-item" key={comment.id}>
            <strong>{comment.authorName ?? "Climber"}</strong>
            <span>{comment.createdAt ? ` · ${comment.createdAt}` : ""}</span>
            <br />
            {comment.body}
          </p>
        ))}
      </div>
    </article>
  );
}

function getCommentPath(targetType: "post" | "session_plan", targetId: string) {
  return targetType === "post" ? `/v1/posts/${targetId}/comments` : `/v1/session-plans/${targetId}/comments`;
}
