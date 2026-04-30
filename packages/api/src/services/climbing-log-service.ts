import { climbingLogs, desc, eq, isNull } from "@zac/db";
import { findLogFixture, logFixtures, type CreateClimbingLogInput, type LogSummary } from "@zac/shared";
import { ApiError } from "../errors.js";
import { getDatabase } from "../integrations/database.js";
import { isRuntimeFallbackAllowed } from "../integrations/env.js";
import { isUuid } from "./ids.js";
import { canViewResource, filterVisibleResources } from "./visibility-service.js";

const createdClimbingLogs: LogSummary[] = [];
let createdClimbingLogCount = 0;

export async function listClimbingLogs(viewerId?: string) {
  const persisted = await listPersistentClimbingLogs(viewerId);
  if (!isRuntimeFallbackAllowed()) {
    return persisted;
  }

  return [...createdClimbingLogs, ...persisted, ...logFixtures];
}

export async function getClimbingLog(logId: string, viewerId?: string) {
  if (isUuid(logId)) {
    const persisted = await getPersistentClimbingLog(logId, viewerId);

    if (persisted) {
      return persisted;
    }
  }

  if (!isRuntimeFallbackAllowed()) {
    return undefined;
  }

  return createdClimbingLogs.find((log) => log.id === logId) ?? findLogFixture(logId);
}

export async function createClimbingLog(input: CreateClimbingLogInput, actorId?: string) {
  const persisted = await createPersistentClimbingLog(input, actorId);

  if (persisted) {
    return persisted;
  }

  return createMemoryClimbingLog(input);
}

function createMemoryClimbingLog(input: CreateClimbingLogInput) {
  createdClimbingLogCount += 1;
  const log: LogSummary = {
    id: `local-log-${createdClimbingLogCount}`,
    title: input.summary || `${input.climbedOn}の記録`,
    place: input.placeName ?? "ジム未接続",
    grade: input.gradeText ?? "未設定",
    note: input.note ?? "",
  };

  createdClimbingLogs.unshift(log);
  return log;
}

async function createPersistentClimbingLog(input: CreateClimbingLogInput, actorId?: string) {
  const db = getDatabase();

  if (!db || !actorId) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Database is required for climbing logs.", 503);
    }
    return null;
  }

  try {
    const [row] = await db
      .insert(climbingLogs)
      .values({
        createdBy: actorId,
        sessionPlanId: input.sessionPlanId ?? null,
        gymId: input.gymId ?? null,
        placeName: input.placeName ?? null,
        disciplineId: input.disciplineId ?? null,
        climbedOn: input.climbedOn,
        gradeText: input.gradeText ?? null,
        summary: input.summary ?? null,
        note: input.note ?? null,
        visibility: input.visibility,
      })
      .returning();

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      title: row.summary || `${row.climbedOn}の記録`,
      place: row.placeName ?? "ジム未接続",
      grade: row.gradeText ?? "未設定",
      note: row.note ?? "",
    } satisfies LogSummary;
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not create climbing log.", 503);
    }
    return null;
  }
}

async function listPersistentClimbingLogs(viewerId?: string) {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  try {
    const rows = await db.select().from(climbingLogs).where(isNull(climbingLogs.deletedAt)).orderBy(desc(climbingLogs.createdAt)).limit(50);
    const visibleRows = await filterVisibleResources(
      rows.map((row) => ({
        ...row,
        ownerId: row.createdBy,
        participantPlanId: row.sessionPlanId,
      })),
      viewerId,
    );
    return visibleRows.map(toLogSummary);
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not list climbing logs.", 503);
    }
    return [];
  }
}

async function getPersistentClimbingLog(logId: string, viewerId?: string) {
  const db = getDatabase();

  if (!db) {
    return null;
  }

  try {
    const [row] = await db.select().from(climbingLogs).where(eq(climbingLogs.id, logId)).limit(1);

    if (!row || row.deletedAt) {
      return null;
    }

    const canView = await canViewResource(
      {
        id: row.id,
        ownerId: row.createdBy,
        visibility: row.visibility,
        participantPlanId: row.sessionPlanId,
      },
      viewerId,
    );
    return canView ? toLogSummary(row) : null;
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not load climbing log.", 503);
    }
    return null;
  }
}

function toLogSummary(row: typeof climbingLogs.$inferSelect) {
  return {
    id: row.id,
    title: row.summary || `${row.climbedOn}の記録`,
    place: row.placeName ?? "ジム未接続",
    grade: row.gradeText ?? "未設定",
    note: row.note ?? "",
  } satisfies LogSummary;
}
