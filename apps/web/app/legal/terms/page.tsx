import Link from "next/link";
import { AppShell } from "../../../src/features/home/app-shell";

export default function TermsPage() {
  return (
    <AppShell activeTab="me">
      <article className="form-panel">
        <p className="card-kind">Legal</p>
        <h1>利用規約</h1>
        <p>Zacは、クライミングジムとイベントの公式情報確認を支援するサービスです。</p>
        <section className="stack">
          <h2>利用条件</h2>
          <p>ユーザーは、正確なプロフィール情報を登録し、他者の安全、プライバシー、権利を尊重して利用します。</p>
          <h2>禁止事項</h2>
          <p>ハラスメント、スパム、危険行為の助長、個人情報の無断投稿、権利侵害、なりすまし、不正アクセスを禁止します。</p>
          <h2>投稿と画像</h2>
          <p>投稿者は、投稿・画像に必要な権利と許諾を持つものとします。運営は、安全確保や権利保護のため、投稿の非表示や削除を行う場合があります。</p>
          <h2>免責</h2>
          <p>クライミングは危険を伴います。Zac上の予定や投稿は安全を保証するものではありません。ユーザーは各施設のルールと自身の判断で行動します。</p>
          <h2>問い合わせ</h2>
          <p>通報、安全問題、削除依頼はアプリ内通報または運営窓口から連絡してください。</p>
        </section>
        <Link className="ghost-button" href="/settings">
          設定へ
        </Link>
      </article>
    </AppShell>
  );
}
