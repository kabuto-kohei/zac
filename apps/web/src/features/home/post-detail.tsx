import { AppShell } from "./app-shell";
import { AuthGate } from "./auth-gate";
import { ProtectedPostDetail } from "./protected-activity-detail";

export function PostDetail({ postId }: { postId: string }) {
  return (
    <AppShell activeTab="home">
      <AuthGate action="投稿詳細はログイン後に閲覧できます">
        <ProtectedPostDetail postId={postId} />
      </AuthGate>
    </AppShell>
  );
}
