"use client";

import { useRouter } from "next/navigation";

export function DetailBackButton() {
  const router = useRouter();

  return (
    <button className="detail-back-link" onClick={() => router.back()} type="button">
      ← 戻る
    </button>
  );
}
