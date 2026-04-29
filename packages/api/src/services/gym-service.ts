import { and, eq, gymSaves, gyms, isNull } from "@zac/db";
import { findGymFixture, gymFixtures, type GymSummary } from "@zac/shared";
import { getDatabase } from "../integrations/database.js";
import { isUuid } from "./ids.js";

const savedGymIds = new Set<string>();

export async function listGyms() {
  const rows = await listPersistentGyms();
  const gyms = rows.length > 0 ? rows : gymFixtures;
  return gyms.map((gym) => ({ ...gym, saved: gym.saved || savedGymIds.has(gym.id) }));
}

export async function getGym(gymId: string) {
  if (isUuid(gymId)) {
    const row = await getPersistentGym(gymId);

    if (row) {
      return row;
    }
  }

  const fixture = findGymFixture(gymId);
  return fixture ? { ...fixture, saved: fixture.saved || savedGymIds.has(fixture.id) } : undefined;
}

export async function saveGym(gymId: string, actorId?: string) {
  const persisted = await setPersistentGymSave(gymId, actorId, true);

  if (!persisted) {
    savedGymIds.add(gymId);
  }

  return { gymId, saved: true };
}

export async function unsaveGym(gymId: string, actorId?: string) {
  const persisted = await setPersistentGymSave(gymId, actorId, false);

  if (!persisted) {
    savedGymIds.delete(gymId);
  }

  return { gymId, saved: false };
}

async function listPersistentGyms() {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  try {
    const rows = await db.select().from(gyms).where(isNull(gyms.deletedAt)).limit(50);
    return rows.map(toGymSummary);
  } catch {
    return [];
  }
}

async function getPersistentGym(gymId: string) {
  const db = getDatabase();

  if (!db) {
    return null;
  }

  try {
    const [row] = await db.select().from(gyms).where(eq(gyms.id, gymId)).limit(1);
    return row && !row.deletedAt ? toGymSummary(row) : null;
  } catch {
    return null;
  }
}

function toGymSummary(row: typeof gyms.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    area: row.area ?? "",
    address: row.address ?? "",
    disciplines: "ボルダー / リード",
    openingHours: row.openingHoursText ?? "",
    saved: false,
  } satisfies GymSummary;
}

async function setPersistentGymSave(gymId: string, actorId: string | undefined, saved: boolean) {
  const db = getDatabase();

  if (!db || !actorId || !isUuid(gymId)) {
    return false;
  }

  try {
    if (saved) {
      await db.insert(gymSaves).values({ gymId, userId: actorId }).onConflictDoNothing();
    } else {
      await db.delete(gymSaves).where(and(eq(gymSaves.gymId, gymId), eq(gymSaves.userId, actorId)));
    }
    return true;
  } catch {
    return false;
  }
}
