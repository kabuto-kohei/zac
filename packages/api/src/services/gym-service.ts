import { eq, gyms, isNull } from "@zac/db";
import { findGymFixture, gymFixtures, type GymSummary } from "@zac/shared";
import { getDatabase } from "../integrations/database.js";
import { isUuid } from "./ids.js";

export async function listGyms() {
  const rows = await listPersistentGyms();
  return rows.length > 0 ? rows : gymFixtures;
}

export async function getGym(gymId: string) {
  if (isUuid(gymId)) {
    const row = await getPersistentGym(gymId);

    if (row) {
      return row;
    }
  }

  return findGymFixture(gymId);
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
