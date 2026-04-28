import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "./app-shell";
import { findLogFixture } from "@zac/shared";

export function LogDetail({ logId }: { logId: string }) {
  const log = findLogFixture(logId);

  if (!log) {
    notFound();
  }

  return (
    <AppShell activeTab="logs" action={<Link className="primary-action" href="/plans/new">次回予定</Link>}>
      <section className="hero-card">
        <div className="hero-visual log-visual" />
        <div>
          <p className="card-kind">{log.place}</p>
          <h2>{log.title}</h2>
          <p>{log.grade}</p>
          <p>{log.note}</p>
        </div>
      </section>
      <section className="stack">
        <article className="wide-card">
          <p className="card-kind">投稿</p>
          <h3>記録から投稿へ</h3>
          <p>API接続後に投稿作成と公開範囲を接続します。</p>
        </article>
      </section>
    </AppShell>
  );
}

