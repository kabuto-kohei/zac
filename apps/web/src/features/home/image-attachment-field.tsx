"use client";

import { useState } from "react";
import { postApi } from "./api-client";
import { getBrowserSupabaseClient } from "./integration-provider";

type UploadTargetType = "post" | "climbing_log";

type MediaUploadUrl = {
  bucket: string;
  path: string;
  signedUrl: string;
  token: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  maxBytes: number;
};

export function ImageAttachmentField() {
  const [fileNames, setFileNames] = useState<string[]>([]);

  return (
    <label>
      画像
      <input
        accept="image/*"
        multiple
        name="images"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []).slice(0, 4);
          setFileNames(files.map((file) => file.name));
        }}
        type="file"
      />
      <span className="field-help">jpg/png/webp、最大4枚、1枚5MBまで。</span>
      {fileNames.length > 0 ? (
        <span className="file-list">
          {fileNames.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </span>
      ) : null}
    </label>
  );
}

export async function uploadSelectedImages(targetType: UploadTargetType, targetId: string, formData: FormData) {
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, 4);

  if (files.length === 0) {
    return { ok: true as const, paths: [] as string[], message: "" };
  }

  const uploadUrlResponse = await postApi<MediaUploadUrl[]>("/v1/media/upload-urls", {
    targetType,
    targetId,
    files: files.map((file) => ({
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    })),
  });

  if (!uploadUrlResponse.ok) {
    return {
      ok: false as const,
      paths: [] as string[],
      message: uploadUrlResponse.message,
    };
  }

  const supabase = getBrowserSupabaseClient();

  if (!supabase) {
    return {
      ok: false as const,
      paths: [] as string[],
      message: "Storage接続が未設定です。",
    };
  }

  const uploadedPaths: string[] = [];

  for (const [index, file] of files.entries()) {
    const uploadUrl = uploadUrlResponse.data[index];

    if (!uploadUrl) {
      return {
        ok: false as const,
        paths: uploadedPaths,
        message: "アップロードURLの数が一致しません。",
      };
    }

    const { error } = await supabase.storage.from(uploadUrl.bucket).uploadToSignedUrl(uploadUrl.path, uploadUrl.token, file, {
      contentType: uploadUrl.contentType,
      upsert: false,
    });

    if (error) {
      return {
        ok: false as const,
        paths: uploadedPaths,
        message: "画像アップロードに失敗しました。",
      };
    }

    uploadedPaths.push(uploadUrl.path);
  }

  return {
    ok: true as const,
    paths: uploadedPaths,
    message: `${uploadedPaths.length}枚の画像をアップロードしました。`,
  };
}
