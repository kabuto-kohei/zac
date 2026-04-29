import { and, desc, eq, isNull, sessionPlanParticipants, sessionPlans } from "@zac/db";
import { findPlanFixture, planFixtures, type CreateClimbingLogInput, type CreateSessionPlanInput, type PlanSummary } from "@zac/shared";
import { getDatabase } from "../integrations/database.js";
import { createClimbingLog } from "./climbing-log-service.js";
import { isUuid } from "./ids.js";
import { canViewResource, filterVisibleResources } from "./visibility-service.js";

const createdSessionPlans: PlanSummary[] = [];
const joinedSessionPlans = new Set<string>();
const completedSessionPlans = new Set<string>();
let createdSessionPlanCount = 0;

export async function listSessionPlans(viewerId?: string) {
  const persisted = await listPersistentSessionPlans(viewerId);
  return [...createdSessionPlans, ...persisted, ...planFixtures];
}

export async function getSessionPlan(planId: string, viewerId?: string) {
  if (isUuid(planId)) {
    const persisted = await getPersistentSessionPlan(planId, viewerId);

    if (persisted) {
      return persisted;
    }
  }

  return createdSessionPlans.find((plan) => plan.id === planId) ?? findPlanFixture(planId);
}

export async function createSessionPlan(input: CreateSessionPlanInput, actorId?: string) {
  const persisted = await createPersistentSessionPlan(input, actorId);

  if (persisted) {
    return persisted;
  }

  return createMemorySessionPlan(input);
}

export async function joinSessionPlan(planId: string, actorId?: string) {
  const persisted = await setPersistentSessionPlanParticipation(planId, "joined", actorId);

  if (!persisted) {
    joinedSessionPlans.add(planId);
  }

  return { planId, joined: true };
}

export async function cancelSessionPlanJoin(planId: string, actorId?: string) {
  const persisted = await setPersistentSessionPlanParticipation(planId, "cancelled", actorId);

  if (!persisted) {
    joinedSessionPlans.delete(planId);
  }

  return { planId, joined: false };
}

export async function completeSessionPlan(planId: string) {
  const persisted = await completePersistentSessionPlan(planId);

  if (!persisted) {
    completedSessionPlans.add(planId);
  }

  return { planId, completed: true };
}

export async function convertSessionPlanToLog(planId: string, actorId?: string) {
  const plan = await getSessionPlan(planId, actorId);

  if (!plan) {
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);
  const input = {
    placeName: plan.place,
    climbedOn: today,
    summary: plan.title,
    note: `${plan.title}のセッション記録`,
    visibility: "private",
  } satisfies CreateClimbingLogInput;

  await completeSessionPlan(planId);
  return createClimbingLog(input, actorId);
}

function createMemorySessionPlan(input: CreateSessionPlanInput) {
  createdSessionPlanCount += 1;
  const plan: PlanSummary = {
    id: `local-plan-${createdSessionPlanCount}`,
    title: input.title,
    place: input.placeName ?? "ジム未接続",
    time: formatDateTime(input.startAt),
    members: input.maxParticipants ? `1/${input.maxParticipants}人` : "1人",
    visibility: input.visibility,
  };

  createdSessionPlans.unshift(plan);
  return plan;
}

async function createPersistentSessionPlan(input: CreateSessionPlanInput, actorId?: string) {
  const db = getDatabase();

  if (!db || !actorId) {
    return null;
  }

  try {
    const [row] = await db
      .insert(sessionPlans)
      .values({
        createdBy: actorId,
        gymId: input.gymId ?? null,
        placeName: input.placeName ?? null,
        title: input.title,
        disciplineId: input.disciplineId ?? null,
        startAt: new Date(input.startAt),
        endAt: new Date(input.endAt),
        visibility: input.visibility,
        joinPolicy: input.joinPolicy,
        maxParticipants: input.maxParticipants ?? null,
        note: input.note ?? null,
      })
      .returning();

    if (!row) {
      return null;
    }

    await db
      .insert(sessionPlanParticipants)
      .values({
        planId: row.id,
        userId: actorId,
        status: "joined",
        joinedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [sessionPlanParticipants.planId, sessionPlanParticipants.userId],
        set: {
          status: "joined",
          joinedAt: new Date(),
          updatedAt: new Date(),
        },
      });

    return {
      id: row.id,
      title: row.title,
      place: row.placeName ?? "ジム未接続",
      time: formatDateTime(row.startAt.toISOString()),
      members: row.maxParticipants ? `1/${row.maxParticipants}人` : "1人",
      visibility: row.visibility,
    } satisfies PlanSummary;
  } catch {
    return null;
  }
}

async function setPersistentSessionPlanParticipation(planId: string, status: "joined" | "cancelled", actorId?: string) {
  const db = getDatabase();

  if (!db || !actorId || !isUuid(planId)) {
    return false;
  }

  try {
    await db
      .insert(sessionPlanParticipants)
      .values({
        planId,
        userId: actorId,
        status,
        joinedAt: status === "joined" ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: [sessionPlanParticipants.planId, sessionPlanParticipants.userId],
        set: {
          status,
          joinedAt: status === "joined" ? new Date() : null,
          updatedAt: new Date(),
        },
      });
    return true;
  } catch {
    return false;
  }
}

async function completePersistentSessionPlan(planId: string) {
  const db = getDatabase();

  if (!db || !isUuid(planId)) {
    return false;
  }

  try {
    const rows = await db
      .update(sessionPlans)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(and(eq(sessionPlans.id, planId), isNull(sessionPlans.deletedAt)))
      .returning({ id: sessionPlans.id });
    return rows.length > 0;
  } catch {
    return false;
  }
}

async function listPersistentSessionPlans(viewerId?: string) {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  try {
    const rows = await db.select().from(sessionPlans).where(isNull(sessionPlans.deletedAt)).orderBy(desc(sessionPlans.createdAt)).limit(50);
    const visibleRows = await filterVisibleResources(
      rows.map((row) => ({
        ...row,
        ownerId: row.createdBy,
        participantPlanId: row.id,
      })),
      viewerId,
    );
    return visibleRows.map(toPlanSummary);
  } catch {
    return [];
  }
}

async function getPersistentSessionPlan(planId: string, viewerId?: string) {
  const db = getDatabase();

  if (!db) {
    return null;
  }

  try {
    const [row] = await db.select().from(sessionPlans).where(eq(sessionPlans.id, planId)).limit(1);

    if (!row || row.deletedAt) {
      return null;
    }

    const canView = await canViewResource(
      {
        id: row.id,
        ownerId: row.createdBy,
        visibility: row.visibility,
        participantPlanId: row.id,
      },
      viewerId,
    );
    return canView ? toPlanSummary(row) : null;
  } catch {
    return null;
  }
}

function toPlanSummary(row: typeof sessionPlans.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    place: row.placeName ?? "ジム未接続",
    time: formatDateTime(row.startAt.toISOString()),
    members: row.maxParticipants ? `1/${row.maxParticipants}人` : "1人",
    visibility: row.visibility,
  } satisfies PlanSummary;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
