"use client";

import { getBrowserSupabaseClient } from "./integration-provider";

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

export async function postApi<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: await getJsonHeaders(),
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      message: payload?.error?.message ?? "保存に失敗しました。",
    };
  }

  return {
    ok: true,
    data: payload.data as T,
  };
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
}

async function getJsonHeaders() {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  const supabase = getBrowserSupabaseClient();
  const session = supabase ? await supabase.auth.getSession() : null;
  const accessToken = session?.data.session?.access_token;

  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }

  return headers;
}
