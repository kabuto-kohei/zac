import Link from "next/link";
import { AppShell, type Tab } from "./app-shell";

export function V2Placeholder({ featureName }: { featureName: string }) {
  return (
    <section className="empty-state">
      <p className="card-kind">V2</p>
      <h2>{featureName}は V2 以降で拡張します</h2>
      <p>V1 はイベントカレンダー、掲載ジム情報、ログインユーザーの情報更新申請に集中します。</p>
      <div className="action-row">
        <Link className="primary-action" href="/">
          カレンダー
        </Link>
        <Link className="ghost-button" href="/explore">
          ジムを見る
        </Link>
      </div>
    </section>
  );
}

export function V2PlaceholderPage({ featureName, activeTab = "home" }: { featureName: string; activeTab?: Tab }) {
  return (
    <AppShell activeTab={activeTab}>
      <V2Placeholder featureName={featureName} />
    </AppShell>
  );
}
