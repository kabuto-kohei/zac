"use client";

import { announcementFixtures, auditLogFixtures, eventFixtures, gymFixtures, postFixtures, reportFixtures } from "@zac/shared";
import Link from "next/link";
import { useState } from "react";
import { patchAdminApi, postAdminApi } from "./api-client";

type AdminView = "dashboard" | "users" | "gyms" | "events" | "posts" | "reports" | "auditLogs" | "announcements";

const navItems: Array<{ id: AdminView; href: string; label: string }> = [
  { id: "dashboard", href: "/dashboard", label: "ダッシュボード" },
  { id: "users", href: "/users", label: "ユーザー" },
  { id: "gyms", href: "/gyms", label: "ジム" },
  { id: "events", href: "/events", label: "イベント" },
  { id: "posts", href: "/posts", label: "投稿" },
  { id: "reports", href: "/reports", label: "通報" },
  { id: "auditLogs", href: "/audit-logs", label: "監査ログ" },
  { id: "announcements", href: "/announcements", label: "お知らせ" },
];

export function AdminDashboard({ view }: { view: AdminView }) {
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <p className="eyebrow">Zac Admin</p>
          <h1>運営管理</h1>
        </div>
        <nav aria-label="Admin navigation">
          {navItems.map((item) => (
            <Link aria-current={item.id === view ? "page" : undefined} className={item.id === view ? "admin-nav active" : "admin-nav"} href={item.href} key={item.id}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="admin-content">
        {view === "dashboard" ? <DashboardView /> : null}
        {view === "users" ? <UsersView /> : null}
        {view === "gyms" ? <GymsView /> : null}
        {view === "events" ? <EventsView /> : null}
        {view === "posts" ? <PostsView /> : null}
        {view === "reports" ? <ReportsView /> : null}
        {view === "auditLogs" ? <AuditLogsView /> : null}
        {view === "announcements" ? <AnnouncementsView /> : null}
      </section>
    </main>
  );
}

function DashboardView() {
  return (
    <>
      <div className="admin-title">
        <h2>ダッシュボード</h2>
        <p>通報、投稿、予定、ジム更新を確認します。</p>
      </div>
      <section className="metric-grid">
        <Metric label="未対応通報" value={String(reportFixtures.filter((report) => report.status === "open").length)} />
        <Metric label="登録ジム" value={String(gymFixtures.length)} />
        <Metric label="イベント" value={String(eventFixtures.length)} />
        <Metric label="投稿" value={String(postFixtures.length)} />
        <Metric label="お知らせ" value={String(announcementFixtures.length)} />
      </section>
    </>
  );
}

function UsersView() {
  return (
    <TableView
      description="ユーザー状態管理はAPI認可と監査ログ接続後に操作を有効化します。"
      rows={[
        ["Climber", "active", "東京"],
        ["Guest", "active", "神奈川"],
      ]}
      title="ユーザー管理"
    />
  );
}

function GymsView() {
  return (
    <>
      <div className="admin-title">
        <h2>ジム管理</h2>
        <p>ジム情報は公開情報または許諾済み情報のみ登録します。</p>
      </div>
      <section className="admin-table">
        {gymFixtures.map((gym) => (
          <GymModerationRow gym={gym} key={gym.id} />
        ))}
      </section>
    </>
  );
}

function EventsView() {
  return (
    <TableView
      description="イベント掲載内容と公開状態を確認します。"
      rows={eventFixtures.map((event) => [event.title, event.gymName, event.status])}
      title="イベント管理"
    />
  );
}

function PostsView() {
  return (
    <>
      <div className="admin-title">
        <h2>投稿管理</h2>
        <p>非表示操作は管理APIへ送信され、監査ログに記録されます。</p>
      </div>
      <section className="admin-table">
        {postFixtures.map((post) => (
          <PostModerationRow post={post} key={post.id} />
        ))}
      </section>
    </>
  );
}

function ReportsView() {
  return (
    <>
      <div className="admin-title">
        <h2>通報管理</h2>
        <p>通報状態の更新は管理APIへ送信され、監査ログに記録されます。</p>
      </div>
      <section className="admin-table">
        {reportFixtures.map((report) => (
          <ReportModerationRow report={report} key={report.id} />
        ))}
      </section>
    </>
  );
}

function AuditLogsView() {
  return (
    <TableView
      description="管理者操作は必ず監査ログに残します。"
      rows={auditLogFixtures.map((log) => [log.action, log.targetType, log.createdAt])}
      title="監査ログ"
    />
  );
}

function AnnouncementsView() {
  return (
    <TableView
      description="利用者向けのお知らせ内容と掲載状態を確認します。"
      rows={announcementFixtures.map((announcement) => [announcement.title, announcement.audience, announcement.status])}
      title="お知らせ管理"
    />
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="admin-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function TableView({ description, rows, title }: { description: string; rows: string[][]; title: string }) {
  return (
    <>
      <div className="admin-title">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <section className="admin-table">
        {rows.map((row) => (
          <article className="admin-row" key={row.join("-")}>
            {row.map((cell) => (
              <span key={cell}>{cell}</span>
            ))}
          </article>
        ))}
      </section>
    </>
  );
}

function ReportModerationRow({ report }: { report: (typeof reportFixtures)[number] }) {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    const nextStatus = formData.get("status")?.toString() || "reviewing";
    const response = await patchAdminApi<{ reportId: string; status: string }>(`/v1/admin/reports/${report.id}/status`, {
      status: nextStatus,
      action: nextStatus === "resolved" ? "dismiss_report" : "mark_review_pending",
      reason: formData.get("reason")?.toString() || null,
    });

    if (!response.ok) {
      setStatus("error");
      setMessage(response.message);
      return;
    }

    setStatus("success");
    setMessage(`状態を ${response.data.status} に更新しました。`);
  }

  return (
    <form action={submit} className="admin-row moderation-row">
      <span>{report.id}</span>
      <span>{report.category}</span>
      <span>{report.status}</span>
      <select aria-label="通報状態" defaultValue="reviewing" name="status">
        <option value="reviewing">reviewing</option>
        <option value="resolved">resolved</option>
        <option value="open">open</option>
      </select>
      <input aria-label="対応理由" maxLength={1000} name="reason" placeholder="理由" />
      <button type="submit">更新</button>
      <StatusMessage message={message} status={status} />
    </form>
  );
}

function PostModerationRow({ post }: { post: (typeof postFixtures)[number] }) {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    const action = formData.get("action")?.toString() || "hide_post";
    const response = await postAdminApi<{ postId: string; action: string }>(`/v1/admin/posts/${post.id}/moderation`, {
      action,
      reason: formData.get("reason")?.toString() || null,
    });

    if (!response.ok) {
      setStatus("error");
      setMessage(response.message);
      return;
    }

    setStatus("success");
    setMessage(`操作 ${response.data.action} を記録しました。`);
  }

  return (
    <form action={submit} className="admin-row moderation-row">
      <span>{post.sourceLabel}</span>
      <span>{post.visibility}</span>
      <span>{post.authorName}</span>
      <select aria-label="投稿操作" defaultValue="hide_post" name="action">
        <option value="hide_post">hide_post</option>
        <option value="dismiss_report">dismiss_report</option>
      </select>
      <input aria-label="対応理由" maxLength={1000} name="reason" placeholder="理由" />
      <button type="submit">実行</button>
      <StatusMessage message={message} status={status} />
    </form>
  );
}

function GymModerationRow({ gym }: { gym: (typeof gymFixtures)[number] }) {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    const nextStatus = formData.get("status")?.toString() || "published";
    const response = await patchAdminApi<{ gymId: string; status: string }>(`/v1/admin/gyms/${gym.id}/status`, {
      status: nextStatus,
      reason: formData.get("reason")?.toString() || null,
    });

    if (!response.ok) {
      setStatus("error");
      setMessage(response.message);
      return;
    }

    setStatus("success");
    setMessage(`状態を ${response.data.status} に更新しました。`);
  }

  return (
    <form action={submit} className="admin-row moderation-row">
      <span>{gym.name}</span>
      <span>{gym.area}</span>
      <span>{gym.disciplines}</span>
      <select aria-label="ジム状態" defaultValue="published" name="status">
        <option value="published">published</option>
        <option value="draft">draft</option>
        <option value="closed">closed</option>
      </select>
      <input aria-label="対応理由" maxLength={1000} name="reason" placeholder="理由" />
      <button type="submit">更新</button>
      <StatusMessage message={message} status={status} />
    </form>
  );
}

function StatusMessage({ message, status }: { message: string; status: string }) {
  if (!message) {
    return null;
  }

  return <span className={status === "error" ? "admin-status error" : "admin-status"}>{message}</span>;
}
