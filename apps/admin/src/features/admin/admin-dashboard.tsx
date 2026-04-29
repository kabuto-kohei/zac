"use client";

import { announcementFixtures, auditLogFixtures, eventFixtures, gymFixtures, postFixtures, reportFixtures } from "@zac/shared";
import type { AdminUserSummary, AnnouncementSummary, AuditLogSummary, EventSummary, GymSummary, PostSummary, ReportSummary } from "@zac/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminApi, isAdminLiveApiMode, patchAdminApi, postAdminApi } from "./api-client";
import { getAdminSupabaseClient } from "./integration-provider";

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
  const session = useAdminSession();

  if (session.checking) {
    return (
      <main className="admin-shell">
        <section className="admin-content">
          <div className="admin-title">
            <h2>認証確認</h2>
            <p>管理画面の認証状態を確認しています。</p>
          </div>
        </section>
      </main>
    );
  }

  if (!session.authenticated) {
    return <AdminLoginGate />;
  }

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

function AdminLoginGate() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "sent">("idle");

  async function submit(formData: FormData) {
    const email = formData.get("email")?.toString().trim();

    if (!email) {
      setStatus("error");
      setMessage("メールアドレスを入力してください。");
      return;
    }

    const supabase = getAdminSupabaseClient();

    if (!supabase) {
      setStatus("error");
      setMessage("管理画面の認証設定が見つかりません。");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setStatus("error");
      setMessage("認証メールの送信に失敗しました。");
      return;
    }

    setStatus("sent");
    setMessage("認証メールを送信しました。リンクを開くと管理画面に戻ります。");
  }

  return (
    <main className="admin-shell">
      <section className="admin-content">
        <form action={submit} className="admin-login-panel">
          <p className="eyebrow">Zac Admin</p>
          <h1>管理者ログイン</h1>
          <p>管理操作と監査ログは、認証済みの管理者だけが利用できます。</p>
          <label>
            メールアドレス
            <input autoComplete="email" inputMode="email" name="email" placeholder="admin@example.com" />
          </label>
          <button type="submit">認証メールを送信</button>
          {message ? <p className={status === "error" ? "admin-status error" : "admin-status"}>{message}</p> : null}
        </form>
      </section>
    </main>
  );
}

function useAdminSession() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = getAdminSupabaseClient();

    if (!supabase) {
      setChecking(false);
      setAuthenticated(false);
      return;
    }

    const client = supabase;

    async function loadSession() {
      const session = await client.auth.getSession();

      if (active) {
        setAuthenticated(Boolean(session.data.session?.access_token));
        setChecking(false);
      }
    }

    const subscription = client.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session?.access_token));
      setChecking(false);
    });

    void loadSession();

    return () => {
      active = false;
      subscription.data.subscription.unsubscribe();
    };
  }, []);

  return { authenticated, checking };
}

function DashboardView() {
  const adminData = useAdminDashboardData();

  return (
    <>
      <div className="admin-title">
        <h2>ダッシュボード</h2>
        <p>通報、投稿、予定、ジム更新を確認します。</p>
      </div>
      <AdminDataStatus message={adminData.message} />
      <section className="metric-grid">
        <Metric label="未対応通報" value={String(adminData.reports.filter((report) => report.status === "open").length)} />
        <Metric label="登録ジム" value={String(adminData.gyms.length)} />
        <Metric label="イベント" value={String(adminData.events.length)} />
        <Metric label="投稿" value={String(adminData.posts.length)} />
        <Metric label="お知らせ" value={String(adminData.announcements.length)} />
      </section>
    </>
  );
}

function UsersView() {
  const { data: users, message } = useAdminList<AdminUserSummary>("/v1/admin/users", [
    { id: "local-climber", email: "climber@example.com", displayName: "Climber", status: "active", area: "東京", createdAt: "" },
    { id: "local-guest", email: "guest@example.com", displayName: "Guest", status: "active", area: "神奈川", createdAt: "" },
  ]);

  return (
    <>
      <div className="admin-title">
        <h2>ユーザー管理</h2>
        <p>認証済みユーザーとプロフィール状態を確認します。</p>
      </div>
      <AdminDataStatus message={message} />
      <section className="admin-table">
        {users.map((user) => (
          <article className="admin-row" key={user.id}>
            <span>{user.displayName}</span>
            <span>{user.email}</span>
            <span>{user.status}</span>
            <span>{user.area || "未設定"}</span>
          </article>
        ))}
        {users.length === 0 ? <EmptyAdminRow /> : null}
      </section>
    </>
  );
}

function GymsView() {
  const { data: gyms, message } = useAdminList<GymSummary>("/v1/gyms", gymFixtures);

  return (
    <>
      <div className="admin-title">
        <h2>ジム管理</h2>
        <p>ジム情報は公開情報または許諾済み情報のみ登録します。</p>
      </div>
      <AdminDataStatus message={message} />
      <section className="admin-table">
        {gyms.map((gym) => (
          <GymModerationRow gym={gym} key={gym.id} />
        ))}
        {gyms.length === 0 ? <EmptyAdminRow /> : null}
      </section>
    </>
  );
}

function EventsView() {
  const { data: events, message } = useAdminList<EventSummary>("/v1/admin/events", eventFixtures);

  return (
    <>
      <div className="admin-title">
        <h2>イベント管理</h2>
        <p>イベント掲載内容と公開状態を確認します。</p>
      </div>
      <AdminDataStatus message={message} />
      <section className="admin-table">
        {events.map((event) => (
          <article className="admin-row" key={event.id}>
            <span>{event.title}</span>
            <span>{event.gymName}</span>
            <span>{event.startsAt}</span>
            <span>{event.status}</span>
          </article>
        ))}
        {events.length === 0 ? <EmptyAdminRow /> : null}
      </section>
    </>
  );
}

function PostsView() {
  const { data: posts, message } = useAdminList<PostSummary>("/v1/posts", postFixtures);

  return (
    <>
      <div className="admin-title">
        <h2>投稿管理</h2>
        <p>非表示操作は管理APIへ送信され、監査ログに記録されます。</p>
      </div>
      <AdminDataStatus message={message} />
      <section className="admin-table">
        {posts.map((post) => (
          <PostModerationRow post={post} key={post.id} />
        ))}
        {posts.length === 0 ? <EmptyAdminRow /> : null}
      </section>
    </>
  );
}

function ReportsView() {
  const { data: reports, message } = useAdminList<ReportSummary>("/v1/reports", reportFixtures);

  return (
    <>
      <div className="admin-title">
        <h2>通報管理</h2>
        <p>通報状態の更新は管理APIへ送信され、監査ログに記録されます。</p>
      </div>
      <AdminDataStatus message={message} />
      <section className="admin-table">
        {reports.map((report) => (
          <ReportModerationRow report={report} key={report.id} />
        ))}
        {reports.length === 0 ? <EmptyAdminRow /> : null}
      </section>
    </>
  );
}

function AuditLogsView() {
  const { data: auditLogs, message } = useAdminList<AuditLogSummary>("/v1/admin/audit-logs", auditLogFixtures);

  return (
    <>
      <div className="admin-title">
        <h2>監査ログ</h2>
        <p>管理者操作は必ず監査ログに残します。</p>
      </div>
      <AdminDataStatus message={message} />
      <section className="admin-table">
        {auditLogs.map((log) => (
          <article className="admin-row" key={log.id}>
            <span>{log.action}</span>
            <span>{log.targetType}</span>
            <span>{log.createdAt}</span>
          </article>
        ))}
        {auditLogs.length === 0 ? <EmptyAdminRow /> : null}
      </section>
    </>
  );
}

function AnnouncementsView() {
  const { data: announcements, message } = useAdminList<AnnouncementSummary>("/v1/admin/announcements", announcementFixtures);

  return (
    <>
      <div className="admin-title">
        <h2>お知らせ管理</h2>
        <p>利用者向けのお知らせ内容と掲載状態を確認します。</p>
      </div>
      <AdminDataStatus message={message} />
      <section className="admin-table">
        {announcements.map((announcement) => (
          <article className="admin-row" key={announcement.id}>
            <span>{announcement.title}</span>
            <span>{announcement.audience}</span>
            <span>{announcement.status}</span>
            <span>{announcement.publishedAt || "未公開"}</span>
          </article>
        ))}
        {announcements.length === 0 ? <EmptyAdminRow /> : null}
      </section>
    </>
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

function ReportModerationRow({ report }: { report: ReportSummary }) {
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

function PostModerationRow({ post }: { post: PostSummary }) {
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

function GymModerationRow({ gym }: { gym: GymSummary }) {
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

function EmptyAdminRow() {
  return (
    <article className="admin-row">
      <span>データを取得できませんでした。</span>
      <span>API接続または権限を確認してください。</span>
      <span />
    </article>
  );
}

function AdminDataStatus({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return <p className="admin-data-status">{message}</p>;
}

function useAdminDashboardData() {
  const gyms = useAdminList<GymSummary>("/v1/gyms", gymFixtures);
  const posts = useAdminList<PostSummary>("/v1/posts", postFixtures);
  const reports = useAdminList<ReportSummary>("/v1/reports", reportFixtures);
  const events = useAdminList<EventSummary>("/v1/admin/events", eventFixtures);
  const announcements = useAdminList<AnnouncementSummary>("/v1/admin/announcements", announcementFixtures);
  const message = [gyms.message, posts.message, reports.message, events.message, announcements.message].find(Boolean) ?? "";

  return {
    gyms: gyms.data,
    posts: posts.data,
    reports: reports.data,
    events: events.data,
    announcements: announcements.data,
    message,
  };
}

function useAdminList<T>(path: string, localFallback: T[]) {
  const liveMode = isAdminLiveApiMode();
  const [data, setData] = useState<T[]>(liveMode ? [] : localFallback);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      const response = await getAdminApi<T[]>(path);

      if (!active) {
        return;
      }

      if (response.ok) {
        setData(response.data);
        setMessage("");
        return;
      }

      setData(liveMode ? [] : localFallback);
      setMessage(liveMode ? response.message : "");
    }

    void load();

    return () => {
      active = false;
    };
  }, [path, liveMode, localFallback]);

  return { data, message };
}
