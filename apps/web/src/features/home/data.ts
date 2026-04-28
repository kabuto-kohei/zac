import {
  feedFixtures,
  findGymFixture,
  findLogFixture,
  findPlanFixture,
  findPostFixture,
  gymFixtures,
  logFixtures,
  planFixtures,
  postFixtures,
  type GymSummary,
  type LogSummary,
  type PlanSummary,
  type PostSummary,
} from "@zac/shared";
import type { Tab } from "./app-shell";

export type { GymSummary, LogSummary, PlanSummary, PostSummary };

export type HomeFeedItem =
  | { type: "session_plan"; item: PlanSummary }
  | { type: "climbing_log"; item: LogSummary }
  | { type: "post"; item: PostSummary };

export type HomeViewData = {
  activeTab: Tab;
  gyms: GymSummary[];
  plans: PlanSummary[];
  logs: LogSummary[];
  posts: PostSummary[];
  feed: HomeFeedItem[];
  metrics: {
    weeklyPlans: number;
    savedGyms: number;
    logs: number;
  };
};

export function getHomeViewData(activeTab: Tab): HomeViewData {
  return {
    activeTab,
    gyms: gymFixtures,
    plans: planFixtures,
    logs: logFixtures,
    posts: postFixtures,
    feed: feedFixtures,
    metrics: {
      weeklyPlans: planFixtures.length,
      savedGyms: gymFixtures.filter((gym) => gym.saved).length,
      logs: logFixtures.length,
    },
  };
}

export function getGymDetailData(gymId: string) {
  const gym = findGymFixture(gymId);

  return {
    gym,
    relatedPlans: gym ? planFixtures.filter((plan) => plan.place === gym.name) : [],
  };
}

export function getPlanDetailData(planId: string) {
  return findPlanFixture(planId);
}

export function getLogDetailData(logId: string) {
  return findLogFixture(logId);
}

export function getPostDetailData(postId: string) {
  return findPostFixture(postId);
}

export function getGymOptions() {
  return gymFixtures.map((gym) => ({
    id: gym.id,
    name: gym.name,
  }));
}
