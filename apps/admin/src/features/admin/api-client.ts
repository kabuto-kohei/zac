"use client";

import { getAdminSupabaseClient } from "./integration-provider";

type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

export async function patchAdminApi<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  return sendAdminApi<T>("PATCH", path, body);
}

export async function postAdminApi<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  return sendAdminApi<T>("POST", path, body);
}

async function sendAdminApi<T>(method: "PATCH" | "POST", path: string, body: unknown): Promise<ApiResult<T>> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers: await getJsonHeaders(),
      body: JSON.stringify(body),
    });
  } catch {
    return {
      ok: false,
      message: "APIに接続できません。ローカルでは `pnpm dev:api` を起動してください。",
    };
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      message: payload?.error?.message ?? "管理操作に失敗しました。",
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
  const supabase = getAdminSupabaseClient();
  const session = supabase ? await supabase.auth.getSession() : null;
  const accessToken = session?.data.session?.access_token;

  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }

  return headers;
}
