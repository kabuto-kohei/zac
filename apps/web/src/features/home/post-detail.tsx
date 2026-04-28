import { findPostFixture } from "@zac/shared";
import { notFound } from "next/navigation";
import { AppShell } from "./app-shell";

export function PostDetail({ postId }: { postId: string }) {
  const post = findPostFixture(postId);

  if (!post) {
    notFound();
  }

  return (
    <AppShell activeTab="home">
      <section className="hero-card">
        <div className="hero-visual post-visual" />
        <div>
          <p className="card-kind">投稿 · {post.visibility}</p>
          <h2>{post.sourceLabel}</h2>
          <p>{post.body}</p>
          <p>{post.authorName} · {post.sourceType}</p>
        </div>
      </section>
      <section className="stack">
        <article className="wide-card">
          <p className="card-kind">コメント</p>
          <h3>コメントはまだありません</h3>
          <p>API接続後に対象リソースの公開範囲を継承して表示します。</p>
        </article>
      </section>
    </AppShell>
  );
}

