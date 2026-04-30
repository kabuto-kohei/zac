import { adminMemberships, and, auditLogs, desc, eq, gyms, moderationActions, posts, reports, userProfiles, users } from "@zac/db";
import type { AdminUserSummary, AuditLogSummary, ModeratePostInput, UpdateGymStatusInput, UpdateReportStatusInput } from "@zac/shared";
import type { RequestActor } from "../auth.js";
import { ApiError } from "../errors.js";
import { getDatabase } from "../integrations/database.js";
import { isRuntimeFallbackAllowed } from "../integrations/env.js";
import { isUuid } from "./ids.js";

type AuditTarget = {
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

const memoryAuditLogs: AuditLogSummary[] = [];
const testAdminEmail = "admin@example.test";

export async function requireAdminActor(actor: RequestActor | null): Promise<RequestActor> {
  if (!actor) {
    throw new ApiError("unauthorized", "Admin login is required.", 401);
  }

  if (await isAdmin(actor)) {
    return actor;
  }

  throw new ApiError("forbidden", "Admin permission is required.", 403);
}

export async function listAuditLogs() {
  const db = getDatabase();

  if (!db) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Database is required for audit logs.", 503);
    }
    return [...memoryAuditLogs, ...[]];
  }

  try {
    const rows = await db.select().from(auditLogs).limit(100);
    return rows.map((row) => ({
      id: row.id,
      action: row.action,
      targetType: row.targetType ?? "",
      actorName: row.actorId,
      createdAt: row.createdAt.toISOString(),
    })) satisfies AuditLogSummary[];
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not list audit logs.", 503);
    }
    return [...memoryAuditLogs];
  }
}

export async function listAdminUsers() {
  const db = getDatabase();

  if (!db) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Database is required for admin users.", 503);
    }
    return [];
  }

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(100);

  return Promise.all(
    rows.map(async (row) => {
      const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, row.id)).limit(1);
      return {
        id: row.id,
        email: row.email ?? "",
        displayName: profile?.displayName ?? "(未設定)",
        status: row.status,
        area: profile?.homeArea ?? "",
        createdAt: row.createdAt.toISOString(),
      } satisfies AdminUserSummary;
    }),
  );
}

export async function updateReportStatus(reportId: string, input: UpdateReportStatusInput, actor: RequestActor) {
  await persistReportStatus(reportId, input, actor);
  await writeAuditLog(actor, {
    action: "report_status_update",
    targetType: "report",
    targetId: reportId,
    metadata: input,
  });

  return {
    reportId,
    status: input.status,
  };
}

export async function moderatePost(postId: string, input: ModeratePostInput, actor: RequestActor) {
  await persistPostModeration(postId, input, actor);
  await writeAuditLog(actor, {
    action: input.action,
    targetType: "post",
    targetId: postId,
    metadata: input,
  });

  return {
    postId,
    action: input.action,
  };
}

export async function updateGymStatus(gymId: string, input: UpdateGymStatusInput, actor: RequestActor) {
  await persistGymStatus(gymId, input);
  await writeAuditLog(actor, {
    action: "gym_status_update",
    targetType: "gym",
    targetId: gymId,
    metadata: input,
  });

  return {
    gymId,
    status: input.status,
  };
}

export async function recordAdminAudit(actor: RequestActor, target: AuditTarget) {
  await writeAuditLog(actor, target);
}

async function isAdmin(actor: RequestActor) {
  if (process.env.NODE_ENV === "test" && actor.email === testAdminEmail) {
    return true;
  }

  const db = getDatabase();

  if (!db) {
    return false;
  }

  const rows = await db
    .select({ userId: adminMemberships.userId })
    .from(adminMemberships)
    .where(and(eq(adminMemberships.userId, actor.userId), eq(adminMemberships.enabled, true)))
    .limit(1);
  return rows.length > 0;
}

async function persistReportStatus(reportId: string, input: UpdateReportStatusInput, actor: RequestActor) {
  const db = getDatabase();

  if (!db || !isUuid(reportId)) {
    return;
  }

  await db.update(reports).set({ status: input.status, updatedAt: new Date() }).where(eq(reports.id, reportId));
  await db.insert(moderationActions).values({
    reportId,
    targetType: "report",
    targetId: reportId,
    action: input.action,
    reason: input.reason ?? null,
    createdBy: actor.userId,
  });
}

async function persistPostModeration(postId: string, input: ModeratePostInput, actor: RequestActor) {
  const db = getDatabase();

  if (!db || !isUuid(postId)) {
    return;
  }

  if (input.action === "hide_post") {
    await db.update(posts).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(posts.id, postId));
  }

  await db.insert(moderationActions).values({
    targetType: "post",
    targetId: postId,
    action: input.action,
    reason: input.reason ?? null,
    createdBy: actor.userId,
  });
}

async function persistGymStatus(gymId: string, input: UpdateGymStatusInput) {
  const db = getDatabase();

  if (!db || !isUuid(gymId)) {
    return;
  }

  await db.update(gyms).set({ status: input.status, updatedAt: new Date() }).where(eq(gyms.id, gymId));
}

async function writeAuditLog(actor: RequestActor, target: AuditTarget) {
  const db = getDatabase();

  if (db && (!target.targetId || isUuid(target.targetId))) {
    await db.insert(auditLogs).values({
      actorId: actor.userId,
      action: target.action,
      targetType: target.targetType,
      targetId: target.targetId ?? null,
      metadata: target.metadata ?? {},
    });
    return;
  }

  memoryAuditLogs.unshift({
    id: `audit-local-${memoryAuditLogs.length + 1}`,
    action: target.action,
    targetType: target.targetType,
    actorName: actor.email ?? actor.userId,
    createdAt: new Date().toISOString(),
  });
}
