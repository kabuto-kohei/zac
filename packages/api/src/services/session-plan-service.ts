import { findPlanFixture, planFixtures } from "@zac/shared";

export function listSessionPlans() {
  return planFixtures;
}

export function getSessionPlan(planId: string) {
  return findPlanFixture(planId);
}

