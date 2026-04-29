"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingLabel }: { children: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <button aria-disabled={pending} className="primary-action" disabled={pending} type="submit">
      {pending ? (pendingLabel ?? "送信中") : children}
    </button>
  );
}
