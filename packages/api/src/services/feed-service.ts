import { feedFixtures } from "@zac/shared";
import { isRuntimeFallbackAllowed } from "../integrations/env.js";
import { listClimbingLogs } from "./climbing-log-service.js";
import { listPosts } from "./post-service.js";
import { listSessionPlans } from "./session-plan-service.js";

export async function getMixedFeed(viewerId?: string) {
  const [plans, logs, posts] = await Promise.all([listSessionPlans(viewerId), listClimbingLogs(viewerId), listPosts(viewerId)]);
  const dynamicFeed = [
    ...plans.slice(0, 10).map((plan) => ({ type: "session_plan" as const, item: plan })),
    ...logs.slice(0, 5).map((log) => ({ type: "climbing_log" as const, item: log })),
    ...posts.slice(0, 10).map((post) => ({ type: "post" as const, item: post })),
  ];

  return dynamicFeed.length > 0 || !isRuntimeFallbackAllowed() ? dynamicFeed : feedFixtures;
}
