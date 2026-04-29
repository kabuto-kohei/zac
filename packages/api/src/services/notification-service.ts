import { and, desc, eq, isNull, notifications } from "@zac/db";
import { notificationFixtures, type NotificationSummary } from "@zac/shared";
import { ApiError } from "../errors.js";
import { getDatabase } from "../integrations/database.js";
import { isUuid } from "./ids.js";

const memoryNotificationsByUser = new Map<string, NotificationSummary[]>();

export async function listNotifications(userId?: string) {
  const actorId = requireUserId(userId);
  const persisted = await listPersistentNotifications(actorId);
  return persisted.length > 0 ? persisted : getMemoryNotifications(actorId);
}

export async function markNotificationRead(notificationId: string, userId?: string) {
  const actorId = requireUserId(userId);
  const persisted = await markPersistentNotificationRead(notificationId, actorId);

  if (persisted) {
    return persisted;
  }

  const readAt = new Date().toISOString();
  const notifications = getMemoryNotifications(actorId);
  const notification = notifications.find((item) => item.id === notificationId);

  if (!notification) {
    throw new ApiError("not_found", "Notification not found.", 404);
  }

  notification.readAt = readAt;
  return notification;
}

function requireUserId(userId: string | undefined) {
  if (!userId) {
    throw new ApiError("unauthorized", "Login is required.", 401);
  }

  return userId;
}

function getMemoryNotifications(userId: string) {
  const existing = memoryNotificationsByUser.get(userId);

  if (existing) {
    return existing;
  }

  const seeded = notificationFixtures.map((notification) => ({ ...notification }));
  memoryNotificationsByUser.set(userId, seeded);
  return seeded;
}

async function listPersistentNotifications(userId: string) {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  try {
    const rows = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.deletedAt)))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    return rows.map(toNotificationSummary);
  } catch {
    return [];
  }
}

async function markPersistentNotificationRead(notificationId: string, userId: string) {
  const db = getDatabase();

  if (!db || !isUuid(notificationId)) {
    return null;
  }

  const [row] = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId), isNull(notifications.deletedAt)))
    .returning();

  return row ? toNotificationSummary(row) : null;
}

function toNotificationSummary(row: typeof notifications.$inferSelect) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body ?? "",
    targetType: row.targetType ?? "",
    targetId: row.targetId ?? "",
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  } satisfies NotificationSummary;
}
