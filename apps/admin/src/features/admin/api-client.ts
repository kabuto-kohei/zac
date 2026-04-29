"use client";

import { getAdminSupabaseClient } from "./integration-provider";

type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

type DataResponse<T> = {
  data: T;
};

export async function patchAdminApi<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  return sendAdminApi<T>("PATCH", path, body);
}

export async function postAdminApi<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  return sendAdminApi<T>("POST", path, body);
}

export async function getAdminApi<T>(path: string): Promise<ApiResult<T>> {
  return sendAdminApi<T>("GET", path);
}

async function sendAdminApi<T>(method: "GET" | "PATCH" | "POST", path: string, body?: unknown): Promise<ApiResult<T>> {
  let response: Response;

  try {
    const init: RequestInit = {
      method,
      headers: await getJsonHeaders(),
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    response = await fetch(`${getApiBaseUrl()}${path}`, init);
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
    data: (payload as DataResponse<T>).data,
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

export function isAdminLiveApiMode() {
  return process.env.NEXT_PUBLIC_APP_ENV === "production";
}
