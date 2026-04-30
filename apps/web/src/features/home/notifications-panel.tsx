"use client";

import type { NotificationSummary } from "@zac/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getApi, patchApi } from "./api-client";
import { AppShell } from "./app-shell";
import { useAuthStatus } from "./auth-state";
import { SubmitButton } from "./submit-button";

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
  const [message, setMessage] = useState("読み込み中");
  const { authenticated, checking } = useAuthStatus();

  useEffect(() => {
    if (checking) {
      return;
    }

    if (!authenticated) {
      setMessage("");
      return;
    }

    void loadNotifications();
  }, [authenticated, checking]);

  async function loadNotifications() {
    const response = await getApi<NotificationSummary[]>("/v1/notifications");

    if (!response.ok) {
      setMessage(response.message);
      return;
    }

    setNotifications(response.data);
    setMessage(response.data.length === 0 ? "通知はありません。" : "");
  }

  async function markRead(notificationId: string) {
    const response = await patchApi<NotificationSummary>(`/v1/notifications/${notificationId}/read`);

    if (!response.ok) {
      setMessage(response.message);
      return;
    }

    setNotifications((items) => items.map((item) => (item.id === response.data.id ? response.data : item)));
    setMessage("");
  }

  return (
    <AppShell activeTab="home">
      <section className="stack">
        <div className="section-title">
          <h2>通知</h2>
          <span>{notifications.filter((notification) => !notification.readAt).length}件未読</span>
        </div>
        {!checking && !authenticated ? (
          <article className="wide-card">
            <p className="card-kind">ログインが必要です</p>
            <h3>通知はログイン後に確認できます</h3>
            <p>参加予定、保存、運営からのお知らせを自分の状態に合わせて表示します。</p>
            <Link className="primary-action" href="/login">
              ログイン
            </Link>
          </article>
        ) : null}
        {message ? <p className="field-help">{message}</p> : null}
        {notifications.map((notification) => (
          <article className={notification.readAt ? "wide-card muted-card" : "wide-card"} key={notification.id}>
            <p className="card-kind">{notification.type}</p>
            <h3>{notification.title}</h3>
            <p>{notification.body}</p>
            {!notification.readAt ? (
              <form action={() => markRead(notification.id)}>
                <SubmitButton pendingLabel="更新中">既読</SubmitButton>
              </form>
            ) : null}
          </article>
        ))}
      </section>
    </AppShell>
  );
}
