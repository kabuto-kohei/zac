"use client";

import type { ReactNode } from "react";
import { AuthRequiredNote } from "./auth-required-note";
import { useAuthStatus } from "./auth-state";

export function AuthGate({ action, children }: { action: string; children: ReactNode }) {
  const { authenticated, checking } = useAuthStatus();

  if (checking) {
    return (
      <section className="wide-card">
        <p className="card-kind">認証確認</p>
        <h3>ログイン状態を確認しています</h3>
        <p>公開情報はHomeと探すから閲覧できます。</p>
      </section>
    );
  }

  if (!authenticated) {
    return <AuthRequiredNote action={action} />;
  }

  return children;
}
