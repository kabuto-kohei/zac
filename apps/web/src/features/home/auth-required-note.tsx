"use client";

import Link from "next/link";
import { useAuthStatus } from "./auth-state";

export function AuthRequiredNote({ action }: { action: string }) {
  const { authenticated, checking } = useAuthStatus();

  if (checking || authenticated) {
    return null;
  }

  return (
    <article className="auth-required-note">
      <div>
        <p className="card-kind">Login</p>
        <h3>{action}</h3>
      </div>
      <div className="action-row">
        <Link className="primary-action" href="/login">
          ログイン
        </Link>
        <Link className="ghost-button" href="/">
          ゲストで戻る
        </Link>
      </div>
    </article>
  );
}
