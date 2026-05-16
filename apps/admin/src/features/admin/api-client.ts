"use client";

import { getAdminSupabaseClient } from "./integration-provider";

type ApiErrorKind = "auth" | "permission" | "config" | "network" | "server";

type ApiResult<T> = { ok: true; data: T } | { ok: false; kind: ApiErrorKind; message: string; status?: number; code?: string };

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
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return {
      ok: false,
      kind: "config",
      message: "管理API URLが未設定です。Vercel の NEXT_PUBLIC_API_URL を確認してください。",
    };
  }

  try {
    const init: RequestInit = {
      method,
      headers: await getJsonHeaders(),
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    response = await fetch(`${apiBaseUrl}${path}`, init);
  } catch {
    return {
      ok: false,
      kind: "network",
      message: isRemoteApiMode()
        ? "管理APIに接続できません。zac-api のデプロイ状態と NEXT_PUBLIC_API_URL を確認してください。"
        : "管理APIに接続できません。ローカルでは `pnpm dev:api` を起動してください。",
    };
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const code = payload?.error?.code;
    return {
      ok: false,
      kind: getErrorKind(response.status, code),
      status: response.status,
      code,
      message: formatAdminApiError(response.status, code, payload?.error?.message),
    };
  }

  return {
    ok: true,
    data: (payload as DataResponse<T>).data,
  };
}

function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  return process.env.NEXT_PUBLIC_APP_ENV === "production" ? "" : "http://localhost:8787";
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
  return process.env.NEXT_PUBLIC_APP_ENV === "production" || isRemoteApiMode();
}

function isRemoteApiMode() {
  return Boolean(process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost"));
}

function getErrorKind(status: number, code?: string): ApiErrorKind {
  if (status === 401 || code === "unauthorized") {
    return "auth";
  }

  if (status === 403 || code === "forbidden") {
    return "permission";
  }

  return status >= 500 ? "server" : "config";
}

function formatAdminApiError(status: number, code?: string, fallback?: string) {
  if (status === 401 || code === "unauthorized") {
    return "管理者ログインが必要です。ログインし直してください。";
  }

  if (status === 403 || code === "forbidden") {
    return "このアカウントには管理者権限がありません。admin_memberships の登録状態を確認してください。";
  }

  if (status >= 500) {
    return fallback ?? "管理API側でエラーが発生しました。zac-api のログを確認してください。";
  }

  return fallback ?? "管理APIのリクエスト設定を確認してください。";
}
