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
        <p className="card-kind">ログインが必要です</p>
        <h3>{action}</h3>
        <p>公開情報はゲストで閲覧できます。保存や作成はメールリンクでログインすると使えます。</p>
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
