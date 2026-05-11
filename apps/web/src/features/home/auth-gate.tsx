"use client";

import type { ReactNode } from "react";
import { AuthRequiredNote } from "./auth-required-note";
import { useAuthStatus } from "./auth-state";

export function AuthGate({ action, children }: { action: string; children: ReactNode }) {
  const { authenticated, checking } = useAuthStatus();

  if (checking) {
    return (
      <section className="wide-card">
        <p className="card-kind">Loading</p>
        <h3>確認中</h3>
      </section>
    );
  }

  if (!authenticated) {
    return <AuthRequiredNote action={action} />;
  }

  return children;
}
