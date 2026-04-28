import { feedFixtures } from "@zac/shared";
import { listClimbingLogs } from "./climbing-log-service.js";
import { listPosts } from "./post-service.js";
import { listSessionPlans } from "./session-plan-service.js";

export async function getMixedFeed() {
  const [plans, logs, posts] = await Promise.all([listSessionPlans(), listClimbingLogs(), listPosts()]);
  const dynamicFeed = [
    ...plans.slice(0, 10).map((plan) => ({ type: "session_plan" as const, item: plan })),
    ...logs.slice(0, 5).map((log) => ({ type: "climbing_log" as const, item: log })),
    ...posts.slice(0, 10).map((post) => ({ type: "post" as const, item: post })),
  ];

  return dynamicFeed.length > 0 ? dynamicFeed : feedFixtures;
}
