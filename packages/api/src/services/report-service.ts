import { reports } from "@zac/db";
import { type CreateReportInput, type ReportSummary, reportFixtures } from "@zac/shared";
import { getDatabase } from "../integrations/database.js";
import { isUuid } from "./ids.js";

const createdReports: ReportSummary[] = [];
let createdReportCount = 0;

export function listReports() {
  return [...createdReports, ...reportFixtures];
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
    return null;
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
