import { sessionPlans } from "@zac/db";
import { findPlanFixture, planFixtures, type CreateSessionPlanInput, type PlanSummary } from "@zac/shared";
import { getDatabase } from "../integrations/database.js";

const createdSessionPlans: PlanSummary[] = [];
let createdSessionPlanCount = 0;

export function listSessionPlans() {
  return [...createdSessionPlans, ...planFixtures];
}

export function getSessionPlan(planId: string) {
  return createdSessionPlans.find((plan) => plan.id === planId) ?? findPlanFixture(planId);
}

export async function createSessionPlan(input: CreateSessionPlanInput, actorId?: string) {
  const persisted = await createPersistentSessionPlan(input, actorId);

  if (persisted) {
    return persisted;
  }

  return createMemorySessionPlan(input);
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

function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
