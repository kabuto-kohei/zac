import Link from "next/link";
import { AppShell } from "./app-shell";
import { AuthGate } from "./auth-gate";
import { PrivacySettingsPanel } from "./privacy-settings-panel";
import { ProfileSettingsPanel } from "./profile-settings-panel";

export function SettingsHome() {
  return (
    <AppShell activeTab="me">
      <AuthGate action="設定はログイン後に使えます">
        <section className="stack">
          <div className="section-title">
            <h2>設定</h2>
            <span>閲覧</span>
          </div>
          <article className="wide-card">
            <p className="card-kind">表示範囲</p>
            <h3>
              <Link href="/settings/privacy">公開範囲</Link>
            </h3>
          </article>
          <article className="wide-card">
            <p className="card-kind">アカウント</p>
            <h3>
              <Link href="/settings/profile">プロフィール</Link>
            </h3>
          </article>
          <article className="wide-card">
            <p className="card-kind">ポリシー</p>
            <h3>
              <Link href="/legal/terms">利用規約</Link>
            </h3>
          </article>
          <article className="wide-card">
            <p className="card-kind">ポリシー</p>
            <h3>
              <Link href="/legal/privacy">プライバシーポリシー</Link>
            </h3>
          </article>
        </section>
      </AuthGate>
    </AppShell>
  );
}

export function ProfileSettings() {
  return (
    <AppShell activeTab="me">
      <AuthGate action="プロフィール編集はログイン後に使えます">
        <section className="stack">
          <div className="section-title">
            <h2>プロフィール</h2>
            <Link className="ghost-button" href="/settings">
              設定
            </Link>
          </div>
          <ProfileSettingsPanel />
        </section>
      </AuthGate>
    </AppShell>
  );
}

export function PrivacySettings() {
  return (
    <AppShell activeTab="me">
      <AuthGate action="公開範囲設定はログイン後に使えます">
        <section className="stack">
          <div className="section-title">
            <h2>公開範囲</h2>
            <Link className="ghost-button" href="/settings">
              設定
            </Link>
          </div>
          <PrivacySettingsPanel />
        </section>
      </AuthGate>
    </AppShell>
  );
}
