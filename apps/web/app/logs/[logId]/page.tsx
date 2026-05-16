import { redirect } from "next/navigation";

export default async function LogDetailPage({ params }: { params: Promise<{ logId: string }> }) {
  await params;
  redirect("/");
}
