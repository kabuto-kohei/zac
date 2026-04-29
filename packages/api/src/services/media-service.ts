import { randomUUID } from "node:crypto";
import { and, climbingLogImages, eq, mediaDeletionJobs, postImages } from "@zac/db";
import type { AttachMediaInput, CreateMediaUploadUrlsInput, MediaUploadFileInput, MediaUploadTarget } from "@zac/shared";
import { ApiError } from "../errors.js";
import { getDatabase } from "../integrations/database.js";
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

export type AttachedMediaResult = {
  targetType: AttachMediaInput["targetType"];
  targetId: string;
  attachedCount: number;
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

    await scheduleMediaDeletionJob({
      bucket,
      objectPath: data.path,
      targetType: input.targetType,
      targetId: input.targetId,
    });
  }

  return urls;
}

export async function attachUploadedMedia(input: AttachMediaInput, actorId?: string): Promise<AttachedMediaResult> {
  if (!actorId) {
    throw new ApiError("unauthorized", "Login is required to attach images.", 401);
  }

  const db = getDatabase();

  if (!db) {
    throw new ApiError("service_unavailable", "Database is not configured.", 503);
  }

  validateAttachPaths(input);

  const bucket = getApiIntegrationStatus().storage.userMediaBucket;
  const rows = buildMediaAttachmentRows(input);

  try {
    if (input.targetType === "post") {
      await db.insert(postImages).values(rows.map((row) => ({ postId: input.targetId, imageUrl: row.imageUrl, sortOrder: row.sortOrder })));
    } else {
      await db.insert(climbingLogImages).values(rows.map((row) => ({ logId: input.targetId, imageUrl: row.imageUrl, sortOrder: row.sortOrder })));
    }

    for (const path of input.paths) {
      await db
        .delete(mediaDeletionJobs)
        .where(and(eq(mediaDeletionJobs.bucket, bucket), eq(mediaDeletionJobs.objectPath, path), eq(mediaDeletionJobs.status, "pending")));
    }

    return {
      targetType: input.targetType,
      targetId: input.targetId,
      attachedCount: rows.length,
    };
  } catch {
    throw new ApiError("service_unavailable", "Could not persist uploaded images.", 503);
  }
}

export function buildMediaAttachmentRows(input: AttachMediaInput) {
  return input.paths.map((path, index) => ({
    targetType: input.targetType,
    targetId: input.targetId,
    imageUrl: path,
    sortOrder: index,
  }));
}

function validateAttachPaths(input: AttachMediaInput) {
  const expectedPrefix = input.targetType === "post" ? `posts/${input.targetId}/` : `logs/${input.targetId}/`;

  for (const path of input.paths) {
    if (!path.startsWith(expectedPrefix)) {
      throw new ApiError("validation_error", "Uploaded image path does not match target.", 422);
    }
  }
}

export function buildMediaDeletionJob(input: {
  bucket: string;
  objectPath: string;
  targetType?: MediaUploadTarget | undefined;
  targetId?: string | undefined;
}) {
  const runAfter = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return {
    bucket: input.bucket,
    objectPath: input.objectPath,
    targetType: input.targetType ?? null,
    targetId: input.targetId ?? null,
    status: "pending",
    runAfter,
  };
}

async function scheduleMediaDeletionJob(input: {
  bucket: string;
  objectPath: string;
  targetType?: MediaUploadTarget | undefined;
  targetId?: string | undefined;
}) {
  const db = getDatabase();

  if (!db) {
    return;
  }

  try {
    await db.insert(mediaDeletionJobs).values(buildMediaDeletionJob(input));
  } catch {
    // Upload URL creation should not fail just because cleanup scheduling is temporarily unavailable.
  }
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
