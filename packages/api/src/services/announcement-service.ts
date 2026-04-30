import { announcements, desc, eq, isNull } from "@zac/db";
import { announcementFixtures, findAnnouncementFixture, type AnnouncementSummary, type UpsertAdminAnnouncementInput } from "@zac/shared";
import type { RequestActor } from "../auth.js";
import { ApiError } from "../errors.js";
import { getDatabase } from "../integrations/database.js";
import { isRuntimeFallbackAllowed } from "../integrations/env.js";
import { isUuid } from "./ids.js";

const memoryAnnouncements = new Map<string, AnnouncementSummary>();

export async function listAnnouncements(options: { includeDrafts?: boolean } = {}) {
  const rows = await listPersistentAnnouncements(options.includeDrafts ?? false);
  const memoryRows = [...memoryAnnouncements.values()].filter((announcement) => options.includeDrafts || announcement.status === "published");
  if (!isRuntimeFallbackAllowed()) {
    return rows;
  }
  return rows.length > 0 ? rows : [...memoryRows, ...announcementFixtures.filter((announcement) => options.includeDrafts || announcement.status === "published")];
}

export async function getAnnouncement(announcementId: string) {
  const memoryAnnouncement = memoryAnnouncements.get(announcementId);

  if (memoryAnnouncement && memoryAnnouncement.status === "published") {
    return memoryAnnouncement;
  }

  if (isUuid(announcementId)) {
    const row = await getPersistentAnnouncement(announcementId);

    if (row) {
      return row;
    }
  }

  if (!isRuntimeFallbackAllowed()) {
    return undefined;
  }

  const fixture = findAnnouncementFixture(announcementId);
  return fixture && fixture.status === "published" ? fixture : undefined;
}

export async function createAnnouncement(input: UpsertAdminAnnouncementInput, actor: RequestActor) {
  const db = getDatabase();

  if (!db) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Database is required for announcements.", 503);
    }
    const announcement = toMemoryAnnouncement(`announcement-local-${memoryAnnouncements.size + 1}`, input);
    memoryAnnouncements.set(announcement.id, announcement);
    return announcement;
  }

  const [row] = await db
    .insert(announcements)
    .values({
      title: input.title,
      body: input.body,
      status: input.status,
      publishedAt: input.status === "published" ? new Date() : null,
      createdBy: actor.userId,
    })
    .returning();

  if (!row) {
    throw new ApiError("service_unavailable", "Could not create announcement.", 503);
  }

  return toAnnouncementSummary(row);
}

export async function updateAnnouncement(announcementId: string, input: UpsertAdminAnnouncementInput) {
  const db = getDatabase();

  if (!db || !isUuid(announcementId)) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("not_found", "Announcement not found.", 404);
    }
    const announcement = toMemoryAnnouncement(announcementId, input);
    memoryAnnouncements.set(announcement.id, announcement);
    return announcement;
  }

  const [row] = await db
    .update(announcements)
    .set({
      title: input.title,
      body: input.body,
      status: input.status,
      publishedAt: input.status === "published" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(announcements.id, announcementId))
    .returning();

  if (!row) {
    throw new ApiError("not_found", "Announcement not found.", 404);
  }

  return toAnnouncementSummary(row);
}

async function listPersistentAnnouncements(includeDrafts: boolean) {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  try {
    const rows = await db.select().from(announcements).where(isNull(announcements.deletedAt)).orderBy(desc(announcements.createdAt)).limit(50);
    return rows.filter((row) => includeDrafts || row.status === "published").map(toAnnouncementSummary);
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not list announcements.", 503);
    }
    return [];
  }
}

async function getPersistentAnnouncement(announcementId: string) {
  const db = getDatabase();

  if (!db) {
    return null;
  }

  try {
    const [row] = await db.select().from(announcements).where(eq(announcements.id, announcementId)).limit(1);
    return row && !row.deletedAt ? toAnnouncementSummary(row) : null;
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not load announcement.", 503);
    }
    return null;
  }
}

function toAnnouncementSummary(row: typeof announcements.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    audience: "all",
    status: row.status === "published" ? "published" : "draft",
    publishedAt: row.publishedAt ? row.publishedAt.toISOString().replace("T", " ").slice(0, 16) : "",
  } satisfies AnnouncementSummary;
}

function toMemoryAnnouncement(announcementId: string, input: UpsertAdminAnnouncementInput) {
  return {
    id: announcementId,
    title: input.title,
    body: input.body,
    audience: "all",
    status: input.status,
    publishedAt: input.status === "published" ? new Date().toISOString().replace("T", " ").slice(0, 16) : "",
  } satisfies AnnouncementSummary;
}
