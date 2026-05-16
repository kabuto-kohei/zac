import { redirect } from "next/navigation";

export default async function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  await params;
  redirect("/");
}
