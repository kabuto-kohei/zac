import { and, asc, eq, gymSaves, gyms, isNull } from "@zac/db";
import { findGymFixture, gymFixtures, type GymSummary } from "@zac/shared";
import { ApiError } from "../errors.js";
import { getDatabase } from "../integrations/database.js";
import { isRuntimeFallbackAllowed } from "../integrations/env.js";
import { isUuid } from "./ids.js";

const savedGymIds = new Set<string>();
let gymListCache: { expiresAt: number; gyms: GymSummary[] } | null = null;
const gymListCacheTtlMs = 60_000;

export async function listGyms() {
  const rows = await listCachedPersistentGyms();
  const gyms = rows.length > 0 || !isRuntimeFallbackAllowed() ? rows : gymFixtures;
  return gyms.map((gym) => ({ ...gym, saved: gym.saved || savedGymIds.has(gym.id) }));
}

export async function getGym(gymId: string) {
  if (isUuid(gymId)) {
    const row = await getPersistentGym(gymId);

    if (row) {
      return row;
    }
  }

  if (!isRuntimeFallbackAllowed()) {
    return undefined;
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

export function clearGymCache() {
  gymListCache = null;
}

async function listCachedPersistentGyms() {
  const now = Date.now();
  if (gymListCache && gymListCache.expiresAt > now) {
    return gymListCache.gyms;
  }

  const rows = await listPersistentGyms();
  if (rows.length > 0) {
    gymListCache = { expiresAt: now + gymListCacheTtlMs, gyms: rows };
  }
  return rows;
}

async function listPersistentGyms() {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  try {
    const rows = await db
      .select(gymSummaryFields)
      .from(gyms)
      .where(and(isNull(gyms.deletedAt), eq(gyms.status, "published")))
      .orderBy(asc(gyms.area), asc(gyms.name))
      .limit(250);
    return rows.map(toGymSummary);
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not list gyms.", 503);
    }
    return [];
  }
}

async function getPersistentGym(gymId: string) {
  const db = getDatabase();

  if (!db) {
    return null;
  }

  try {
    const [row] = await db.select({ ...gymSummaryFields, deletedAt: gyms.deletedAt, status: gyms.status }).from(gyms).where(eq(gyms.id, gymId)).limit(1);
    return row && !row.deletedAt && row.status === "published" ? toGymSummary(row) : null;
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not load gym.", 503);
    }
    return null;
  }
}

const gymSummaryFields = {
  id: gyms.id,
  name: gyms.name,
  area: gyms.area,
  address: gyms.address,
  disciplinesText: gyms.disciplinesText,
  openingHoursText: gyms.openingHoursText,
  websiteUrl: gyms.websiteUrl,
  instagramHandle: gyms.instagramHandle,
  instagramUrl: gyms.instagramUrl,
  sourceUrl: gyms.sourceUrl,
  sourceAttribution: gyms.sourceAttribution,
  sourceVerifiedAt: gyms.sourceVerifiedAt,
};

function toGymSummary(row: {
  id: string;
  name: string;
  area: string | null;
  address: string | null;
  disciplinesText: string | null;
  openingHoursText: string | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  instagramUrl: string | null;
  sourceUrl: string | null;
  sourceAttribution: string | null;
  sourceVerifiedAt: Date | null;
}) {
  return {
    id: row.id,
    name: row.name,
    area: row.area ?? "",
    address: row.address ?? "",
    disciplines: row.disciplinesText ?? "クライミング",
    openingHours: row.openingHoursText ?? "",
    ...(row.websiteUrl ? { websiteUrl: row.websiteUrl } : {}),
    ...(row.instagramHandle ? { instagramHandle: row.instagramHandle } : {}),
    ...(row.instagramUrl ? { instagramUrl: row.instagramUrl } : {}),
    ...(row.sourceUrl ?? row.websiteUrl ? { sourceUrl: row.sourceUrl ?? row.websiteUrl ?? "" } : {}),
    ...(row.sourceAttribution ? { sourceAttribution: row.sourceAttribution } : {}),
    ...(row.sourceVerifiedAt ? { sourceVerifiedAt: formatDate(row.sourceVerifiedAt) } : {}),
    saved: false,
  } satisfies GymSummary;
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

async function setPersistentGymSave(gymId: string, actorId: string | undefined, saved: boolean) {
  const db = getDatabase();

  if (!db || !actorId || !isUuid(gymId)) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("not_found", "Gym not found.", 404);
    }
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
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not update gym save.", 503);
    }
    return false;
  }
}
