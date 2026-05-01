"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuthStatus } from "./auth-state";

export function ShellActions({ children }: { children?: ReactNode }) {
  const { authenticated, checking } = useAuthStatus();

  if (checking || !authenticated) {
    return (
      <div className="action-row">
        <Link className="primary-action" href="/login">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="action-row">
      <Link className="ghost-button" href="/notifications">
        通知
      </Link>
      {children ?? (
        <Link className="primary-action" href="/plans/new">
          予定作成
        </Link>
      )}
    </div>
  );
}
