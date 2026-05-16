"use client";

import { useRouter } from "next/navigation";

export function DetailBackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button className="detail-back-link" onClick={goBack} type="button">
      ← 戻る
    </button>
  );
}
