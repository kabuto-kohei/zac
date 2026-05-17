"use client";

import {
  announcementFixtures,
  auditLogFixtures,
  eventFixtures,
  eventSourceFixtures,
  gymFixtures,
  instagramReviewQueueFixtures,
  postFixtures,
  reportFixtures,
} from "@zac/shared";
import type {
  AdminUserSummary,
  AnnouncementSummary,
  AuditLogSummary,
  EventSourceSummary,
  EventSummary,
  GymSummary,
  InstagramReviewQueueItem,
  PostSummary,
  ReportSummary,
} from "@zac/shared";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { getAdminApi, isAdminLiveApiMode, patchAdminApi, postAdminApi } from "./api-client";
import { getAdminSupabaseClient } from "./integration-provider";

type AdminView =
  | "dashboard"
  | "users"
  | "gyms"
  | "events"
  | "eventCandidates"
  | "eventSources"
  | "instagramReview"
  | "posts"
  | "reports"
  | "auditLogs"
  | "announcements";
type AdminListState<T> = {
  data: T[];
  loading: boolean;
  message: string;
  failed: boolean;
};

const navItems: Array<{ id: AdminView; href: string; label: string }> = [
  { id: "dashboard", href: "/dashboard", label: "ダッシュボード" },
  { id: "users", href: "/users", label: "ユーザー" },
  { id: "gyms", href: "/gyms", label: "ジム" },
  { id: "events", href: "/events", label: "イベント" },
  { id: "eventCandidates", href: "/event-candidates", label: "候補レビュー" },
  { id: "eventSources", href: "/event-sources", label: "取得源" },
  { id: "instagramReview", href: "/instagram-review", label: "Instagram確認" },
  { id: "posts", href: "/posts", label: "投稿" },
  { id: "reports", href: "/reports", label: "通報" },
  { id: "auditLogs", href: "/audit-logs", label: "監査ログ" },
  { id: "announcements", href: "/announcements", label: "お知らせ" },
];

const adminUserFallback: AdminUserSummary[] = [
  { id: "local-climber", email: "climber@example.com", displayName: "Climber", status: "active", area: "東京", createdAt: "" },
  { id: "local-guest", email: "guest@example.com", displayName: "Guest", status: "active", area: "神奈川", createdAt: "" },
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
        {view === "eventCandidates" ? <EventCandidatesView /> : null}
        {view === "eventSources" ? <EventSourcesView /> : null}
        {view === "instagramReview" ? <InstagramReviewQueueView /> : null}
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
      <AdminViewHeader title="ダッシュボード" description="通報、投稿、予定、ジム更新を確認します。" />
      <AdminDataStatus message={adminData.message} loading={adminData.loading} />
      <section className="metric-grid">
        <Metric label="未対応通報" value={String(adminData.reports.filter((report) => report.status === "open").length)} />
        <Metric label="登録ジム" value={String(adminData.gyms.length)} />
        <Metric label="イベント" value={String(adminData.events.length)} />
        <Metric label="取得源" value={String(adminData.eventSources.length)} />
        <Metric label="投稿" value={String(adminData.posts.length)} />
        <Metric label="お知らせ" value={String(adminData.announcements.length)} />
      </section>
    </>
  );
}

function UsersView() {
  const users = useAdminList<AdminUserSummary>("/v1/admin/users", adminUserFallback);

  return (
    <>
      <AdminViewHeader title="ユーザー管理" description="認証済みユーザーとプロフィール状態を確認します。" />
      <AdminDataStatus state={users} />
      <AdminTable>
        {users.data.map((user) => (
          <article className="admin-row" key={user.id}>
            <AdminInfoCell label="表示名">{user.displayName}</AdminInfoCell>
            <AdminInfoCell label="メール">{user.email}</AdminInfoCell>
            <AdminInfoCell label="状態">{user.status}</AdminInfoCell>
            <AdminInfoCell label="エリア">{user.area || "未設定"}</AdminInfoCell>
          </article>
        ))}
        <AdminEmptyState state={users} emptyMessage="ユーザーはまだありません。" />
      </AdminTable>
    </>
  );
}

function GymsView() {
  const gyms = useAdminList<GymSummary>("/v1/gyms", gymFixtures);

  return (
    <>
      <AdminViewHeader title="ジム管理" description="ジム情報は公開情報または許諾済み情報のみ登録します。" />
      <AdminDataStatus state={gyms} />
      <AdminTable>
        {gyms.data.map((gym) => (
          <GymModerationRow gym={gym} key={gym.id} />
        ))}
        <AdminEmptyState state={gyms} emptyMessage="ジムはまだ登録されていません。" />
      </AdminTable>
    </>
  );
}

function EventsView() {
  const events = useAdminList<EventSummary>("/v1/admin/events", eventFixtures);
  const [items, setItems] = useState(events.data);

  useEffect(() => {
    setItems(events.data);
  }, [events.data]);

  return (
    <>
      <AdminViewHeader title="イベント管理" description="イベント掲載内容を作成・編集し、下書きと公開状態を切り替えます。" />
      <AdminDataStatus state={events} />
      <EventEditorForm
        onSaved={(event) => {
          setItems((current) => [event, ...current.filter((item) => item.id !== event.id)]);
        }}
      />
      <AdminTable>
        {items.map((event) => (
          <EventEditorRow event={event} key={event.id} onSaved={(next) => setItems((current) => current.map((item) => (item.id === next.id ? next : item)))} />
        ))}
        <AdminEmptyState dataLength={items.length} state={events} emptyMessage="イベントはまだありません。" />
      </AdminTable>
    </>
  );
}

function EventSourcesView() {
  const sources = useAdminList<EventSourceSummary>("/v1/admin/event-sources", eventSourceFixtures);
  const approvedCount = sources.data.filter((source) => source.status === "approved").length;
  const candidateCount = sources.data.filter((source) => source.status === "candidate").length;

  return (
    <>
      <AdminViewHeader title="イベント取得源" description="コンペバイブル起点の候補、公式サイト、専門メディアを確認します。" />
      <AdminDataStatus state={sources} />
      <section className="metric-grid compact-metrics">
        <Metric label="承認済み" value={String(approvedCount)} />
        <Metric label="候補" value={String(candidateCount)} />
        <Metric label="合計" value={String(sources.data.length)} />
      </section>
      <AdminTable>
        {sources.data.map((source) => (
          <article className="admin-row source-row" key={source.id}>
            <AdminInfoCell label="名称">{source.displayName}</AdminInfoCell>
            <AdminInfoCell label="媒体">{source.platform}</AdminInfoCell>
            <AdminInfoCell label="ハンドル">{source.handle}</AdminInfoCell>
            <AdminInfoCell label="種別">{source.sourceType}</AdminInfoCell>
            <AdminInfoCell label="状態">{source.status}</AdminInfoCell>
            <AdminInfoCell label="関連">{source.relationshipSourceHandle ?? "-"}</AdminInfoCell>
            <a href={source.sourceUrl} rel="noreferrer" target="_blank">
              開く
            </a>
            <small>{source.discoveryNote}</small>
          </article>
        ))}
        <AdminEmptyState state={sources} emptyMessage="取得源はまだありません。" />
      </AdminTable>
    </>
  );
}

function InstagramReviewQueueView() {
  const queue = useAdminList<InstagramReviewQueueItem>("/v1/admin/instagram-review-queue", instagramReviewQueueFixtures);
  const [items, setItems] = useState(queue.data);
  const highPriorityCount = items.filter((item) => item.priority === "high").length;
  const fallbackCount = items.filter((item) => item.fallbackAvailable).length;

  useEffect(() => {
    setItems(queue.data);
  }, [queue.data]);

  return (
    <>
      <AdminViewHeader title="Instagram確認" description="候補Instagramが対象ジムの公式アカウントか確認し、公式ソースとして使えるものだけ承認します。" />
      <AdminDataStatus state={queue} />
      <section className="metric-grid compact-metrics">
        <Metric label="確認待ち" value={String(items.length)} />
        <Metric label="優先度高" value={String(highPriorityCount)} />
        <Metric label="公式サイトあり" value={String(fallbackCount)} />
      </section>
      <AdminTable>
        {items.map((item) => (
          <InstagramReviewQueueRow item={item} key={item.id} onRecorded={(sourceId) => setItems((current) => current.filter((next) => next.sourceId !== sourceId))} />
        ))}
        <AdminEmptyState dataLength={items.length} state={queue} emptyMessage="Instagram確認待ちはありません。" />
      </AdminTable>
    </>
  );
}

function EventCandidatesView() {
  const candidates = useAdminList<EventSummary>("/v1/admin/event-candidates", eventFixtures.filter((event) => event.status === "draft" || event.reviewStatus === "pending"));
  const [items, setItems] = useState(candidates.data);
  const pendingCount = items.filter((event) => event.reviewStatus !== "approved").length;

  useEffect(() => {
    setItems(candidates.data);
  }, [candidates.data]);

  return (
    <>
      <AdminViewHeader title="候補レビュー" description="自動収集した候補を確認し、公開するものだけ承認します。" />
      <AdminDataStatus state={candidates} />
      <section className="metric-grid compact-metrics">
        <Metric label="確認待ち" value={String(pendingCount)} />
        <Metric label="候補合計" value={String(items.length)} />
        <Metric label="公開済み" value={String(items.filter((event) => event.reviewStatus === "approved").length)} />
      </section>
      <AdminTable>
        {items.map((event) => (
          <EventCandidateRow
            event={event}
            key={event.id}
            onReviewed={(next) => setItems((current) => current.map((item) => (item.id === next.id ? next : item)))}
          />
        ))}
        <AdminEmptyState dataLength={items.length} state={candidates} emptyMessage="確認待ちの候補はありません。" />
      </AdminTable>
    </>
  );
}

function PostsView() {
  const posts = useAdminList<PostSummary>("/v1/posts", postFixtures);

  return (
    <>
      <AdminViewHeader title="投稿管理" description="非表示操作は管理APIへ送信され、監査ログに記録されます。" />
      <AdminDataStatus state={posts} />
      <AdminTable>
        {posts.data.map((post) => (
          <PostModerationRow post={post} key={post.id} />
        ))}
        <AdminEmptyState state={posts} emptyMessage="投稿はまだありません。" />
      </AdminTable>
    </>
  );
}

function ReportsView() {
  const reports = useAdminList<ReportSummary>("/v1/reports", reportFixtures);

  return (
    <>
      <AdminViewHeader title="更新申請・通報管理" description="V1 のジム・イベント更新申請と通報を確認し、対応状態を監査ログに残します。" />
      <AdminDataStatus state={reports} />
      <AdminTable>
        {reports.data.map((report) => (
          <ReportModerationRow report={report} key={report.id} />
        ))}
        <AdminEmptyState state={reports} emptyMessage="更新申請・通報はありません。" />
      </AdminTable>
    </>
  );
}

function AuditLogsView() {
  const auditLogs = useAdminList<AuditLogSummary>("/v1/admin/audit-logs", auditLogFixtures);

  return (
    <>
      <AdminViewHeader title="監査ログ" description="管理者操作は必ず監査ログに残します。" />
      <AdminDataStatus state={auditLogs} />
      <AdminTable>
        {auditLogs.data.map((log) => (
          <article className="admin-row" key={log.id}>
            <AdminInfoCell label="操作">{log.action}</AdminInfoCell>
            <AdminInfoCell label="対象">{log.targetType}</AdminInfoCell>
            <AdminInfoCell label="日時">{log.createdAt}</AdminInfoCell>
          </article>
        ))}
        <AdminEmptyState state={auditLogs} emptyMessage="監査ログはまだありません。" />
      </AdminTable>
    </>
  );
}

function AnnouncementsView() {
  const announcements = useAdminList<AnnouncementSummary>("/v1/admin/announcements", announcementFixtures);
  const [items, setItems] = useState(announcements.data);

  useEffect(() => {
    setItems(announcements.data);
  }, [announcements.data]);

  return (
    <>
      <AdminViewHeader title="お知らせ管理" description="利用者向けのお知らせを作成・編集し、公開と下書きを切り替えます。" />
      <AdminDataStatus state={announcements} />
      <AnnouncementEditorForm
        onSaved={(announcement) => {
          setItems((current) => [announcement, ...current.filter((item) => item.id !== announcement.id)]);
        }}
      />
      <AdminTable>
        {items.map((announcement) => (
          <AnnouncementEditorRow announcement={announcement} key={announcement.id} onSaved={(next) => setItems((current) => current.map((item) => (item.id === next.id ? next : item)))} />
        ))}
        <AdminEmptyState dataLength={items.length} state={announcements} emptyMessage="お知らせはまだありません。" />
      </AdminTable>
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

function AdminViewHeader({ description, title }: { description: string; title: string }) {
  return (
    <div className="admin-title">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function AdminTable({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={["admin-table", className].filter(Boolean).join(" ")}>{children}</section>;
}

function AdminInfoCell({ children, detail, label }: { children: ReactNode; detail?: ReactNode; label?: string }) {
  return (
    <span className="admin-info-cell">
      {label ? <small className="admin-cell-label">{label}</small> : null}
      <strong>{children}</strong>
      {detail ? <small>{detail}</small> : null}
    </span>
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
      <AdminInfoCell label="ID">{report.id}</AdminInfoCell>
      <AdminInfoCell label="種別">{report.category}</AdminInfoCell>
      <AdminInfoCell label="現在">{report.status}</AdminInfoCell>
      <label className="admin-field">
        変更後
        <select defaultValue="reviewing" name="status">
          <option value="reviewing">reviewing</option>
          <option value="resolved">resolved</option>
          <option value="open">open</option>
        </select>
      </label>
      <label className="admin-field">
        対応理由
        <input maxLength={1000} name="reason" placeholder="理由" />
      </label>
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
      <AdminInfoCell label="投稿元">{post.sourceLabel}</AdminInfoCell>
      <AdminInfoCell label="公開状態">{post.visibility}</AdminInfoCell>
      <AdminInfoCell label="投稿者">{post.authorName}</AdminInfoCell>
      <label className="admin-field">
        操作
        <select defaultValue="hide_post" name="action">
          <option value="hide_post">hide_post</option>
          <option value="dismiss_report">dismiss_report</option>
        </select>
      </label>
      <label className="admin-field">
        対応理由
        <input maxLength={1000} name="reason" placeholder="理由" />
      </label>
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
      <AdminInfoCell label="ジム">{gym.name}</AdminInfoCell>
      <AdminInfoCell label="エリア">{gym.area}</AdminInfoCell>
      <AdminInfoCell label="種目">{gym.disciplines}</AdminInfoCell>
      <label className="admin-field">
        状態
        <select defaultValue="published" name="status">
          <option value="published">published</option>
          <option value="draft">draft</option>
          <option value="closed">closed</option>
        </select>
      </label>
      <label className="admin-field">
        対応理由
        <input maxLength={1000} name="reason" placeholder="理由" />
      </label>
      <button type="submit">更新</button>
      <StatusMessage message={message} status={status} />
    </form>
  );
}

function InstagramReviewQueueRow({ item, onRecorded }: { item: InstagramReviewQueueItem; onRecorded: (sourceId: string) => void }) {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  async function recordAction(formData: FormData) {
    setMessage("");
    const action = formData.get("action")?.toString() || "needs_followup";
    const reason = formData.get("reason")?.toString() || null;
    const response = await postAdminApi<{ sourceId: string; action: string; recorded: boolean }>(`/v1/admin/instagram-review-queue/${item.sourceId}/actions`, {
      action,
      reason,
    });

    if (!response.ok) {
      setStatus("error");
      setMessage(response.message);
      return;
    }

    setStatus("success");
    setMessage(action === "confirm_official" ? "公式Instagramとして承認しました。" : action === "reject_official" ? "非公式として却下しました。" : "保留として記録しました。");
    if (action === "confirm_official" || action === "reject_official") {
      onRecorded(item.sourceId);
    }
  }

  return (
    <article className="admin-row instagram-review-row">
      <div className="instagram-review-summary">
        <span>
          <strong>{item.gymName}</strong>
          <small>
            {item.area || "-"} / @{item.handle}
          </small>
          <small>{item.reviewReason}</small>
        </span>
        <span>
          <strong>{item.sourceStatus}</strong>
          <small>{item.sourceVerifiedAt ? `公式確認 ${item.sourceVerifiedAt}` : "公式未確認"}</small>
          <small>{item.failureDetail}</small>
        </span>
        <span>
          <strong>自動取得</strong>
          <small>最終確認 {item.lastCheckedAt || "-"}</small>
          <small>観測 {item.observedPosts}件 / 最新 {item.lastObservedAt || "-"}</small>
        </span>
        <span className="admin-link-stack">
          <a href={item.sourceUrl} rel="noreferrer" target="_blank">
            Instagram
          </a>
          {item.officialSiteUrl ? (
            <a href={item.officialSiteUrl} rel="noreferrer" target="_blank">
              公式サイト
            </a>
          ) : (
            <small>公式サイトなし</small>
          )}
        </span>
      </div>
      <form action={recordAction} className="instagram-review-decision-form">
        <label className="admin-field admin-field-title">
          判断理由
          <input maxLength={1000} name="reason" placeholder="例: 公式サイトからリンクあり / 店舗名・住所・投稿内容が一致 / 別店舗のアカウントだった" />
        </label>
        <button name="action" type="submit" value="confirm_official">
          公式として承認
        </button>
        <button className="secondary-admin-action" name="action" type="submit" value="needs_followup">
          保留
        </button>
        <button className="secondary-admin-action danger-admin-action" name="action" type="submit" value="reject_official">
          非公式として却下
        </button>
      </form>
      <StatusMessage message={message} status={status} />
    </article>
  );
}

function EventCandidateRow({ event, onReviewed }: { event: EventSummary; onReviewed: (event: EventSummary) => void }) {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const reviewReason = buildCandidateReviewReason(event);

  async function submit(formData: FormData) {
    setMessage("");
    const action = formData.get("action")?.toString() === "reject" ? "reject" : "approve";
    const response = await patchAdminApi<EventSummary>(`/v1/admin/events/${event.id}/review`, {
      action,
      reason: formData.get("reason")?.toString() || null,
    });

    if (!response.ok) {
      setStatus("error");
      setMessage(response.message);
      return;
    }

    setStatus("success");
    setMessage(action === "approve" ? "公開候補を承認しました。" : "候補を却下しました。");
    onReviewed(response.data);
  }

  return (
    <form action={submit} className="admin-row candidate-row">
      <div className="candidate-summary">
        <span>
          <strong>{event.title}</strong>
          <small>{event.gymName}</small>
        </span>
        <span>
          <strong>{event.category}</strong>
          <small>{event.startsAt}</small>
        </span>
        <span>
          <strong>{event.reviewStatus ?? "pending"}</strong>
          <small>{event.extractionConfidence == null ? "信頼度 -" : `信頼度 ${Math.round(event.extractionConfidence * 100)}%`}</small>
        </span>
        <span>
          <strong>{event.sourceLabel}</strong>
          {event.sourceUrl ? (
            <a href={event.sourceUrl} rel="noreferrer" target="_blank">
              情報源
            </a>
          ) : (
            <small>情報源なし</small>
          )}
        </span>
        <span>
          <strong>確認理由</strong>
          <small>{reviewReason}</small>
          {event.sourceQuote ? <small>根拠: {event.sourceQuote}</small> : null}
        </span>
      </div>
      <div className="candidate-actions">
        <label className="admin-field">
          レビュー理由
          <input maxLength={1000} name="reason" placeholder="理由" />
        </label>
        <button name="action" type="submit" value="approve">
          承認
        </button>
        <button className="secondary-admin-action" name="action" type="submit" value="reject">
          却下
        </button>
      </div>
      <StatusMessage message={message} status={status} />
    </form>
  );
}

function buildCandidateReviewReason(event: EventSummary) {
  const confidence = event.extractionConfidence == null ? "信頼度未算出" : `信頼度 ${Math.round(event.extractionConfidence * 100)}%`;
  const source = event.sourceUrl ? "証拠URLあり" : "証拠URLなし";
  return `${event.gymName} / ${event.startsAt} / ${event.category} / ${source} / ${confidence}`;
}

function EventEditorForm({ onSaved }: { onSaved: (event: EventSummary) => void }) {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    const body = eventPayloadFromForm(formData);
    const response = await postAdminApi<EventSummary>("/v1/admin/events", body);

    if (!response.ok) {
      setStatus("error");
      setMessage(response.message);
      return;
    }

    setStatus("success");
    setMessage("イベントを保存しました。");
    onSaved(response.data);
  }

  return (
    <form action={submit} className="admin-editor-form">
      <label>
        タイトル
        <input maxLength={120} name="title" placeholder="イベント名" required />
      </label>
      <label>
        開始
        <input name="startsAt" required type="datetime-local" />
      </label>
      <label>
        終了
        <input name="endsAt" type="datetime-local" />
      </label>
      <label>
        状態
        <select defaultValue="draft" name="status">
          <option value="draft">draft</option>
          <option value="scheduled">scheduled</option>
          <option value="closed">closed</option>
        </select>
      </label>
      <label className="admin-editor-wide">
        説明
        <textarea maxLength={2000} name="description" placeholder="掲載内容" />
      </label>
      <button type="submit">作成</button>
      <StatusMessage message={message} status={status} />
    </form>
  );
}

function EventEditorRow({ event, onSaved }: { event: EventSummary; onSaved: (event: EventSummary) => void }) {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    const response = await patchAdminApi<EventSummary>(`/v1/admin/events/${event.id}`, eventPayloadFromForm(formData));

    if (!response.ok) {
      setStatus("error");
      setMessage(response.message);
      return;
    }

    setStatus("success");
    setMessage("イベントを更新しました。");
    onSaved(response.data);
  }

  return (
    <form action={submit} className="admin-row content-editor-row">
      <label className="admin-field">
        イベント名
        <input defaultValue={event.title} maxLength={120} name="title" required />
      </label>
      <AdminInfoCell label="ジム">{event.gymName}</AdminInfoCell>
      <label className="admin-field">
        開始
        <input defaultValue={toDateTimeLocal(event.startsAt)} name="startsAt" required type="datetime-local" />
      </label>
      <label className="admin-field">
        終了
        <input defaultValue={toDateTimeLocal(event.endsAt)} name="endsAt" type="datetime-local" />
      </label>
      <label className="admin-field">
        状態
        <select defaultValue={event.status} name="status">
          <option value="draft">draft</option>
          <option value="scheduled">scheduled</option>
          <option value="closed">closed</option>
        </select>
      </label>
      <label className="admin-field">
        説明
        <input defaultValue={event.description} maxLength={2000} name="description" placeholder="説明" />
      </label>
      <button type="submit">更新</button>
      <StatusMessage message={message} status={status} />
    </form>
  );
}

function AnnouncementEditorForm({ onSaved }: { onSaved: (announcement: AnnouncementSummary) => void }) {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    const response = await postAdminApi<AnnouncementSummary>("/v1/admin/announcements", announcementPayloadFromForm(formData));

    if (!response.ok) {
      setStatus("error");
      setMessage(response.message);
      return;
    }

    setStatus("success");
    setMessage("お知らせを保存しました。");
    onSaved(response.data);
  }

  return (
    <form action={submit} className="admin-editor-form">
      <label>
        タイトル
        <input maxLength={120} name="title" placeholder="お知らせタイトル" required />
      </label>
      <label>
        状態
        <select defaultValue="draft" name="status">
          <option value="draft">draft</option>
          <option value="published">published</option>
        </select>
      </label>
      <label className="admin-editor-wide">
        本文
        <textarea maxLength={4000} name="body" placeholder="本文" required />
      </label>
      <button type="submit">作成</button>
      <StatusMessage message={message} status={status} />
    </form>
  );
}

function AnnouncementEditorRow({ announcement, onSaved }: { announcement: AnnouncementSummary; onSaved: (announcement: AnnouncementSummary) => void }) {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    const response = await patchAdminApi<AnnouncementSummary>(`/v1/admin/announcements/${announcement.id}`, announcementPayloadFromForm(formData));

    if (!response.ok) {
      setStatus("error");
      setMessage(response.message);
      return;
    }

    setStatus("success");
    setMessage("お知らせを更新しました。");
    onSaved(response.data);
  }

  return (
    <form action={submit} className="admin-row announcement-editor-row">
      <label className="admin-field">
        タイトル
        <input defaultValue={announcement.title} maxLength={120} name="title" required />
      </label>
      <label className="admin-field">
        本文
        <textarea defaultValue={announcement.body} maxLength={4000} name="body" required />
      </label>
      <label className="admin-field">
        状態
        <select defaultValue={announcement.status} name="status">
          <option value="draft">draft</option>
          <option value="published">published</option>
        </select>
      </label>
      <AdminInfoCell label="公開日">{announcement.publishedAt || "未公開"}</AdminInfoCell>
      <button type="submit">更新</button>
      <StatusMessage message={message} status={status} />
    </form>
  );
}

function eventPayloadFromForm(formData: FormData) {
  const endsAt = toIsoDateTime(formData.get("endsAt")?.toString());
  return {
    title: formData.get("title")?.toString() ?? "",
    description: formData.get("description")?.toString() || null,
    startsAt: toIsoDateTime(formData.get("startsAt")?.toString()) ?? "",
    endsAt,
    status: formData.get("status")?.toString() || "draft",
  };
}

function announcementPayloadFromForm(formData: FormData) {
  return {
    title: formData.get("title")?.toString() ?? "",
    body: formData.get("body")?.toString() ?? "",
    status: formData.get("status")?.toString() || "draft",
  };
}

function toIsoDateTime(value: string | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

function toDateTimeLocal(value: string) {
  return value ? value.replace(" ", "T") : "";
}

function StatusMessage({ message, status }: { message: string; status: string }) {
  if (!message) {
    return null;
  }

  return <span className={status === "error" ? "admin-status error" : "admin-status"}>{message}</span>;
}

function AdminEmptyState<T>({ dataLength, emptyMessage, state }: { dataLength?: number; emptyMessage: string; state: AdminListState<T> }) {
  const length = dataLength ?? state.data.length;

  if (state.loading || length > 0) {
    return null;
  }

  return <EmptyAdminRow detail={state.failed ? state.message : emptyMessage} title={state.failed ? "データを取得できませんでした。" : emptyMessage} />;
}

function EmptyAdminRow({ detail, title }: { detail: string; title: string }) {
  return (
    <article className="admin-row admin-empty-row">
      <AdminInfoCell detail={detail} label="状態">
        {title}
      </AdminInfoCell>
    </article>
  );
}

function AdminDataStatus<T>({ loading, message, state }: { loading?: boolean; message?: string; state?: AdminListState<T> }) {
  const isLoading = loading ?? state?.loading ?? false;
  const text = message ?? state?.message ?? "";

  if (isLoading) {
    return <p className="admin-data-status">データを読み込んでいます。</p>;
  }

  if (!text) {
    return null;
  }

  return <p className="admin-data-status">{text}</p>;
}

function useAdminDashboardData() {
  const gyms = useAdminList<GymSummary>("/v1/gyms", gymFixtures);
  const posts = useAdminList<PostSummary>("/v1/posts", postFixtures);
  const reports = useAdminList<ReportSummary>("/v1/reports", reportFixtures);
  const events = useAdminList<EventSummary>("/v1/admin/events", eventFixtures);
  const eventSources = useAdminList<EventSourceSummary>("/v1/admin/event-sources", eventSourceFixtures);
  const announcements = useAdminList<AnnouncementSummary>("/v1/admin/announcements", announcementFixtures);
  const message = [gyms.message, posts.message, reports.message, events.message, eventSources.message, announcements.message].find(Boolean) ?? "";
  const loading = [gyms.loading, posts.loading, reports.loading, events.loading, eventSources.loading, announcements.loading].some(Boolean);

  return {
    gyms: gyms.data,
    posts: posts.data,
    reports: reports.data,
    events: events.data,
    eventSources: eventSources.data,
    announcements: announcements.data,
    loading,
    message,
  };
}

function useAdminList<T>(path: string, localFallback: T[]): AdminListState<T> {
  const liveMode = isAdminLiveApiMode();
  const [data, setData] = useState<T[]>(liveMode ? [] : localFallback);
  const [loading, setLoading] = useState(liveMode);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setFailed(false);
      const response = await getAdminApi<T[]>(path);

      if (!active) {
        return;
      }

      if (response.ok) {
        setData(response.data);
        setFailed(false);
        setMessage("");
        setLoading(false);
        return;
      }

      setData(liveMode ? [] : localFallback);
      setFailed(true);
      setMessage(liveMode ? response.message : "");
      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [path, liveMode, localFallback]);

  return { data, failed, loading, message };
}
