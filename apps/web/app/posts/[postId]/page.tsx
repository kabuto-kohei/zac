import { V2PlaceholderPage } from "../../../src/features/home/v2-placeholder";

export default async function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  await params;
  return <V2PlaceholderPage featureName="投稿詳細" />;
}
