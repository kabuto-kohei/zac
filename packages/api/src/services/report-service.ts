import { desc, reports } from "@zac/db";
import { type CreateReportInput, type ReportSummary, reportFixtures } from "@zac/shared";
import { ApiError } from "../errors.js";
import { getDatabase } from "../integrations/database.js";
import { isRuntimeFallbackAllowed } from "../integrations/env.js";
import { isUuid } from "./ids.js";

const createdReports: ReportSummary[] = [];
let createdReportCount = 0;

export async function listReports() {
  const persisted = await listPersistentReports();

  if (!isRuntimeFallbackAllowed()) {
    return persisted;
  }

  return persisted.length > 0 ? persisted : [...createdReports, ...reportFixtures];
}

export async function createReport(input: CreateReportInput, actorId?: string) {
  const persisted = await createPersistentReport(input, actorId);

  if (persisted) {
    return persisted;
  }

  createdReportCount += 1;
  const report = {
    id: `report-created-${createdReportCount}`,
    targetType: input.targetType,
    category: input.category,
    status: "open",
    createdAt: new Intl.DateTimeFormat("ja-JP", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date()),
  } satisfies ReportSummary;

  createdReports.unshift(report);
  return report;
}

async function createPersistentReport(input: CreateReportInput, actorId?: string) {
  const db = getDatabase();

  if (!db || !actorId || !isUuid(input.targetId)) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not create report.", 503);
    }
    return null;
  }

  try {
    const [row] = await db
      .insert(reports)
      .values({
        reporterId: actorId,
        targetType: input.targetType,
        targetId: input.targetId,
        category: input.category,
        body: input.note ?? null,
      })
      .returning();

    return row ? toReportSummary(row) : null;
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not create report.", 503);
    }
    return null;
  }
}

async function listPersistentReports() {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  try {
    const rows = await db.select().from(reports).orderBy(desc(reports.createdAt)).limit(100);
    return rows.map(toReportSummary);
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not list reports.", 503);
    }

    return [];
  }
}

function toReportSummary(row: typeof reports.$inferSelect) {
  return {
    id: row.id,
    targetType: row.targetType,
    category: row.category,
    status: row.status === "reviewing" || row.status === "resolved" ? row.status : "open",
    createdAt: row.createdAt.toISOString(),
  } satisfies ReportSummary;
}
