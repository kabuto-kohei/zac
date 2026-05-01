"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { signOutCurrentUser } from "./auth-session";
import { useAuthStatus } from "./auth-state";

export function ShellActions({ children }: { children?: ReactNode }) {
  const router = useRouter();
  const { authenticated, checking } = useAuthStatus();

  async function logout() {
    await signOutCurrentUser();
    router.push("/");
    router.refresh();
  }

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
      <button className="ghost-button" onClick={logout} type="button">
        ログアウト
      </button>
    </div>
  );
}
