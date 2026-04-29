"use client";

import { getBrowserSupabaseClient } from "./integration-provider";

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

export async function postApi<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  return sendApi<T>("POST", path, body);
}

export async function putApi<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  return sendApi<T>("PUT", path, body);
}

export async function deleteApi<T>(path: string): Promise<ApiResult<T>> {
  return sendApi<T>("DELETE", path);
}

export async function patchApi<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
  return sendApi<T>("PATCH", path, body);
}

export async function getApi<T>(path: string): Promise<ApiResult<T>> {
  return sendApi<T>("GET", path);
}

async function sendApi<T>(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", path: string, body?: unknown): Promise<ApiResult<T>> {
  let response: Response;

  try {
    const init: RequestInit = {
      method,
      headers: await getJsonHeaders(),
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
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
