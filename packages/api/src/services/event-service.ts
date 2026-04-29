import { and, desc, eq, eventSaves, events, gyms, isNull } from "@zac/db";
import { eventFixtures, findEventFixture, type EventSummary } from "@zac/shared";
import { getDatabase } from "../integrations/database.js";
import { isUuid } from "./ids.js";

const savedEventIds = new Set<string>();

export async function listEvents(options: { includeDrafts?: boolean } = {}) {
  const rows = await listPersistentEvents(options.includeDrafts ?? false);
  return rows.length > 0 ? rows : eventFixtures;
}

export async function getEvent(eventId: string) {
  if (isUuid(eventId)) {
    const row = await getPersistentEvent(eventId);

    if (row) {
      return row;
    }
  }

  return findEventFixture(eventId);
}

export async function saveEvent(eventId: string, actorId?: string) {
  const persisted = await setPersistentEventSave(eventId, actorId, true);

  if (!persisted) {
    savedEventIds.add(eventId);
  }

  return { eventId, saved: true };
}

async function listPersistentEvents(includeDrafts: boolean) {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  try {
    const rows = await db
      .select({
        id: events.id,
        title: events.title,
        gymId: events.gymId,
        startsAt: events.startsAt,
        endsAt: events.endsAt,
        status: events.status,
      })
      .from(events)
      .where(isNull(events.deletedAt))
      .orderBy(desc(events.startsAt))
      .limit(50);
    return Promise.all(rows.filter((row) => includeDrafts || row.status !== "draft").map(toEventSummary));
  } catch {
    return [];
  }
}

async function getPersistentEvent(eventId: string) {
  const db = getDatabase();

  if (!db) {
    return null;
  }

  try {
    const [row] = await db
      .select({
        id: events.id,
        title: events.title,
        gymId: events.gymId,
        startsAt: events.startsAt,
        endsAt: events.endsAt,
        status: events.status,
        deletedAt: events.deletedAt,
      })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    return row && !row.deletedAt ? toEventSummary(row) : null;
  } catch {
    return null;
  }
}

async function toEventSummary(row: { id: string; title: string; gymId: string | null; startsAt: Date; endsAt: Date | null; status: string }) {
  return {
    id: row.id,
    title: row.title,
    gymName: await getGymName(row.gymId),
    startsAt: formatDateTime(row.startsAt),
    endsAt: row.endsAt ? formatDateTime(row.endsAt) : "",
    capacity: "定員未設定",
    status: row.status === "closed" ? "closed" : "scheduled",
  } satisfies EventSummary;
}

async function getGymName(gymId: string | null) {
  const db = getDatabase();

  if (!db || !gymId) {
    return "Zac";
  }

  try {
    const [row] = await db.select({ name: gyms.name }).from(gyms).where(eq(gyms.id, gymId)).limit(1);
    return row?.name ?? "Zac";
  } catch {
    return "Zac";
  }
}

function formatDateTime(value: Date) {
  return value.toISOString().replace("T", " ").slice(0, 16);
}

export async function unsaveEvent(eventId: string, actorId?: string) {
  const persisted = await setPersistentEventSave(eventId, actorId, false);

  if (!persisted) {
    savedEventIds.delete(eventId);
  }

  return { eventId, saved: false };
}

async function setPersistentEventSave(eventId: string, actorId: string | undefined, saved: boolean) {
  const db = getDatabase();

  if (!db || !actorId || !isUuid(eventId)) {
    return false;
  }

  try {
    if (saved) {
      await db.insert(eventSaves).values({ eventId, userId: actorId }).onConflictDoNothing();
    } else {
      await db.delete(eventSaves).where(and(eq(eventSaves.eventId, eventId), eq(eventSaves.userId, actorId)));
    }
    return true;
  } catch {
    return false;
  }
}
