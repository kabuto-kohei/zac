import { and, eq, eventSaves } from "@zac/db";
import { eventFixtures, findEventFixture } from "@zac/shared";
import { getDatabase } from "../integrations/database.js";
import { isUuid } from "./ids.js";

const savedEventIds = new Set<string>();

export function listEvents() {
  return eventFixtures;
}

export function getEvent(eventId: string) {
  return findEventFixture(eventId);
}

export async function saveEvent(eventId: string, actorId?: string) {
  const persisted = await setPersistentEventSave(eventId, actorId, true);

  if (!persisted) {
    savedEventIds.add(eventId);
  }

  return { eventId, saved: true };
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
