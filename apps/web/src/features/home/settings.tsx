import Link from "next/link";
import { AppShell } from "./app-shell";

const privacyRows = [
  ["予定の初期表示範囲", "フォロワー"],
  ["記録の初期表示範囲", "自分のみ"],
  ["ホームジム表示", "OFF"],
  ["位置情報利用", "OFF"],
];

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
          <h3>プロフィール</h3>
          <p>編集機能は後続の入力保存処理で接続します。</p>
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
        {privacyRows.map(([label, value]) => (
          <article className="wide-card settings-row" key={label}>
            <div>
              <p className="card-kind">{label}</p>
              <h3>{value}</h3>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
