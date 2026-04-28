import { auditLogFixtures, gymFixtures, postFixtures, reportFixtures } from "@zac/shared";
import Link from "next/link";

type AdminView = "dashboard" | "users" | "gyms" | "posts" | "reports" | "auditLogs";

const navItems: Array<{ id: AdminView; href: string; label: string }> = [
  { id: "dashboard", href: "/dashboard", label: "ダッシュボード" },
  { id: "users", href: "/users", label: "ユーザー" },
  { id: "gyms", href: "/gyms", label: "ジム" },
  { id: "posts", href: "/posts", label: "投稿" },
  { id: "reports", href: "/reports", label: "通報" },
  { id: "auditLogs", href: "/audit-logs", label: "監査ログ" },
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
        {view === "posts" ? <PostsView /> : null}
        {view === "reports" ? <ReportsView /> : null}
        {view === "auditLogs" ? <AuditLogsView /> : null}
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
        <Metric label="投稿" value={String(postFixtures.length)} />
        <Metric label="監査ログ" value={String(auditLogFixtures.length)} />
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
    <TableView
      description="ジム情報は公開情報または許諾済み情報のみ登録します。"
      rows={gymFixtures.map((gym) => [gym.name, gym.area, gym.disciplines])}
      title="ジム管理"
    />
  );
}

function PostsView() {
  return (
    <TableView
      description="非表示や削除はmoderation actionとaudit log接続後に有効化します。"
      rows={postFixtures.map((post) => [post.sourceLabel, post.visibility, post.authorName])}
      title="投稿管理"
    />
  );
}

function ReportsView() {
  return (
    <TableView
      description="通報対応はMVP管理画面の最優先機能です。"
      rows={reportFixtures.map((report) => [report.id, report.category, report.status])}
      title="通報管理"
    />
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

