import { randomUUID } from "node:crypto";
import type { CreateMediaUploadUrlsInput, MediaUploadFileInput, MediaUploadTarget } from "@zac/shared";
import { ApiError } from "../errors.js";
import { getApiIntegrationStatus } from "../integrations/env.js";
import { getSupabaseAdminClient } from "../integrations/supabase.js";

export type MediaUploadUrl = {
  bucket: string;
  path: string;
  signedUrl: string;
  token: string;
  contentType: MediaUploadFileInput["contentType"];
  maxBytes: number;
};

const extensionByContentType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} satisfies Record<MediaUploadFileInput["contentType"], string>;

export async function createMediaUploadUrls(input: CreateMediaUploadUrlsInput, actorId?: string): Promise<MediaUploadUrl[]> {
  if (!actorId) {
    throw new ApiError("unauthorized", "Login is required to upload images.", 401);
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new ApiError("service_unavailable", "Storage is not configured.", 503);
  }

  const bucket = getApiIntegrationStatus().storage.userMediaBucket;
  const urls: MediaUploadUrl[] = [];

  for (const file of input.files) {
    const path = buildUserMediaPath(input.targetType, actorId, input.targetId, file);
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path, {
      upsert: false,
    });

    if (error || !data) {
      throw new ApiError("service_unavailable", "Could not create upload URL.", 503);
    }

    urls.push({
      bucket,
      path: data.path,
      signedUrl: data.signedUrl,
      token: data.token,
      contentType: file.contentType,
      maxBytes: 5 * 1024 * 1024,
    });
  }

  return urls;
}

function buildUserMediaPath(targetType: MediaUploadTarget, actorId: string, targetId: string | undefined, file: MediaUploadFileInput) {
  const imageId = randomUUID();
  const extension = extensionByContentType[file.contentType];

  if (targetType === "avatar") {
    return `users/${actorId}/avatar/${imageId}.${extension}`;
  }

  if (targetType === "post") {
    return `posts/${requireTargetId(targetId)}/${imageId}.${extension}`;
  }

  return `logs/${requireTargetId(targetId)}/${imageId}.${extension}`;
}

function requireTargetId(targetId: string | undefined) {
  if (!targetId) {
    throw new ApiError("validation_error", "targetId is required.", 422);
  }

  return targetId;
}
