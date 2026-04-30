"use client";

import Link from "next/link";
import { useAuthStatus } from "./auth-state";

export function ShellActions() {
  const { authenticated, checking } = useAuthStatus();

  if (!checking && !authenticated) {
    return (
      <div className="action-row">
        <Link className="ghost-button" href="/login">
          ログイン
        </Link>
        <Link className="primary-action" href="/plans/new">
          予定作成
        </Link>
      </div>
    );
  }

  return (
    <div className="action-row">
      <Link className="ghost-button" href="/notifications">
        通知
      </Link>
      <Link className="primary-action" href="/plans/new">
        予定作成
      </Link>
    </div>
  );
}

