import { announcements, desc, eq, isNull } from "@zac/db";
import { announcementFixtures, findAnnouncementFixture, type AnnouncementSummary } from "@zac/shared";
import { getDatabase } from "../integrations/database.js";
import { isUuid } from "./ids.js";

export async function listAnnouncements(options: { includeDrafts?: boolean } = {}) {
  const rows = await listPersistentAnnouncements(options.includeDrafts ?? false);
  return rows.length > 0 ? rows : announcementFixtures;
}

export async function getAnnouncement(announcementId: string) {
  if (isUuid(announcementId)) {
    const row = await getPersistentAnnouncement(announcementId);

    if (row) {
      return row;
    }
  }

  return findAnnouncementFixture(announcementId);
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
    return null;
  }
}

function toAnnouncementSummary(row: typeof announcements.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    audience: "all",
    status: row.status === "published" ? "published" : "draft",
    publishedAt: row.publishedAt ? row.publishedAt.toISOString().replace("T", " ").slice(0, 16) : "",
  } satisfies AnnouncementSummary;
}
