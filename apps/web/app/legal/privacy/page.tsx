import Link from "next/link";
import { AppShell } from "../../../src/features/home/app-shell";

export default function PrivacyPage() {
  return (
    <AppShell activeTab="me">
      <article className="form-panel">
        <p className="card-kind">Legal</p>
        <h1>プライバシーポリシー</h1>
        <p>Zacは、MVP運用に必要な範囲で個人情報と利用データを扱います。</p>
        <section className="stack">
          <h2>取得する情報</h2>
          <p>メールアドレス、プロフィール、予定、記録、投稿、画像、通報、設定、サービス利用状況を取得します。</p>
          <h2>利用目的</h2>
          <p>認証、プロフィール復元、予定・記録・投稿の提供、安全対応、通報対応、障害調査、品質改善に利用します。</p>
          <h2>公開範囲</h2>
          <p>予定、記録、投稿はユーザーが選択した公開範囲に従って表示します。位置情報共有はMVPでは無効です。</p>
          <h2>第三者サービス</h2>
          <p>認証、データ保管、ホスティング、エラー監視、利用状況分析のため、Supabase、Vercel、Sentry、PostHogを利用します。</p>
          <h2>削除と問い合わせ</h2>
          <p>削除依頼、開示・訂正、プライバシーに関する問い合わせは運営窓口で受け付けます。安全上必要な監査ログは一定期間保持します。</p>
        </section>
        <Link className="ghost-button" href="/settings">
          設定へ
        </Link>
      </article>
    </AppShell>
  );
}
