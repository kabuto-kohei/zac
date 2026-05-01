import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "./app-shell";
import { AuthGate } from "./auth-gate";
import { getPostDetailData } from "./data";
import { CommentThread, PostActions } from "./detail-actions";
import { ZacIcon } from "./zac-icons";

export async function PostDetail({ postId }: { postId: string }) {
  const post = await getPostDetailData(postId);

  if (!post) {
    notFound();
  }

  return (
    <AppShell activeTab="home">
      <AuthGate action="投稿詳細はログイン後に閲覧できます">
        <section className="hero-card">
          <div className="hero-visual icon-visual post-visual">
            <ZacIcon decorative icon="bouldering" size={76} />
          </div>
          <div>
            <p className="card-kind">投稿 · {post.visibility}</p>
            <h2>{post.sourceLabel}</h2>
            <p>{post.body}</p>
            <p>{post.authorName} · {post.sourceType}</p>
          </div>
        </section>
        <section className="stack">
          <PostActions postId={post.id} />
          <article className="wide-card action-row">
            <Link className="ghost-button" href={`/reports/new?targetType=post&targetId=${post.id}`}>
              通報
            </Link>
          </article>
          <CommentThread targetId={post.id} targetType="post" />
        </section>
      </AuthGate>
    </AppShell>
  );
}
