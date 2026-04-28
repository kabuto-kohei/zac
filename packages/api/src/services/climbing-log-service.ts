import { climbingLogs } from "@zac/db";
import { findLogFixture, logFixtures, type CreateClimbingLogInput, type LogSummary } from "@zac/shared";
import { getDatabase, getSystemUserId } from "../integrations/database.js";

const createdClimbingLogs: LogSummary[] = [];
let createdClimbingLogCount = 0;

export function listClimbingLogs() {
  return [...createdClimbingLogs, ...logFixtures];
}

export function getClimbingLog(logId: string) {
  return createdClimbingLogs.find((log) => log.id === logId) ?? findLogFixture(logId);
}

export async function createClimbingLog(input: CreateClimbingLogInput) {
  const persisted = await createPersistentClimbingLog(input);

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

async function createPersistentClimbingLog(input: CreateClimbingLogInput) {
  const db = getDatabase();
  const systemUserId = getSystemUserId();

  if (!db || !systemUserId) {
    return null;
  }

  try {
    const [row] = await db
      .insert(climbingLogs)
      .values({
        createdBy: systemUserId,
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
    return null;
  }
}
