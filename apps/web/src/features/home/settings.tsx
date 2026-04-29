import Link from "next/link";
import { AppShell } from "./app-shell";
import { PrivacySettingsPanel } from "./privacy-settings-panel";

export function SettingsHome() {
  return (
    <AppShell activeTab="me">
      <section className="stack">
        <div className="section-title">
          <h2>設定</h2>
          <span>閲覧</span>
        </div>
        <article className="wide-card">
          <p className="card-kind">表示範囲</p>
          <h3>
            <Link href="/settings/privacy">公開範囲と位置情報</Link>
          </h3>
          <p>MVPの初期値と安全設定を確認します。</p>
        </article>
        <article className="wide-card">
          <p className="card-kind">アカウント</p>
          <h3>
            <Link href="/onboarding">プロフィール</Link>
          </h3>
          <p>プロフィールは認証済みセッションでAPIへ保存され、端末を変えても復元できます。</p>
        </article>
      </section>
    </AppShell>
  );
}

export function PrivacySettings() {
  return (
    <AppShell activeTab="me">
      <section className="stack">
        <div className="section-title">
          <h2>公開範囲</h2>
          <Link className="ghost-button" href="/settings">
            設定
          </Link>
        </div>
        <PrivacySettingsPanel />
      </section>
    </AppShell>
  );
}
