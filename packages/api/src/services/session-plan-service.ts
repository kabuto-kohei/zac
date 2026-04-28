import { findPlanFixture, planFixtures, type CreateSessionPlanInput, type PlanSummary } from "@zac/shared";

const createdSessionPlans: PlanSummary[] = [];
let createdSessionPlanCount = 0;

export function listSessionPlans() {
  return [...createdSessionPlans, ...planFixtures];
}

export function getSessionPlan(planId: string) {
  return createdSessionPlans.find((plan) => plan.id === planId) ?? findPlanFixture(planId);
}

export function createSessionPlan(input: CreateSessionPlanInput) {
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

function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
