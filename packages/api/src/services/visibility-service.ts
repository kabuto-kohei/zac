import { and, eq, follows, sessionPlanParticipants } from "@zac/db";
import type { Visibility } from "@zac/shared";
import { getDatabase } from "../integrations/database.js";
import { hasBlockBetween } from "./blocklist-service.js";

export type VisibleResource = {
  id: string;
  ownerId: string;
  visibility: string;
  participantPlanId?: string | null;
};

export function isVisibilityAllowed(visibility: Visibility | string, ownerId: string, viewerId?: string, isFollower = false, isParticipant = false) {
  if (visibility === "public") {
    return true;
  }

  if (!viewerId) {
    return false;
  }

  if (viewerId === ownerId) {
    return true;
  }

  if (visibility === "followers") {
    return isFollower;
  }

  if (visibility === "participants") {
    return isParticipant;
  }

  return false;
}

export async function canViewResource(resource: VisibleResource, viewerId?: string) {
  if (await hasBlockBetween(viewerId, resource.ownerId)) {
    return false;
  }

  const isFollower = await followsOwner(viewerId, resource.ownerId);
  const isParticipant = await participatesInPlan(viewerId, resource.participantPlanId);
  return isVisibilityAllowed(resource.visibility, resource.ownerId, viewerId, isFollower, isParticipant);
}

export async function filterVisibleResources<T extends VisibleResource>(resources: T[], viewerId?: string) {
  const visibilityChecks = await Promise.all(resources.map((resource) => canViewResource(resource, viewerId)));
  return resources.filter((_, index) => visibilityChecks[index]);
}

async function followsOwner(viewerId: string | undefined, ownerId: string) {
  if (!viewerId || viewerId === ownerId) {
    return false;
  }

  const db = getDatabase();

  if (!db) {
    return false;
  }

  const rows = await db.select({ followerId: follows.followerId }).from(follows).where(and(eq(follows.followerId, viewerId), eq(follows.followingId, ownerId))).limit(1);
  return rows.length > 0;
}

async function participatesInPlan(viewerId: string | undefined, planId: string | null | undefined) {
  if (!viewerId || !planId) {
    return false;
  }

  const db = getDatabase();

  if (!db) {
    return false;
  }

  const rows = await db
    .select({ userId: sessionPlanParticipants.userId })
    .from(sessionPlanParticipants)
    .where(and(eq(sessionPlanParticipants.planId, planId), eq(sessionPlanParticipants.userId, viewerId), eq(sessionPlanParticipants.status, "joined")))
    .limit(1);
  return rows.length > 0;
}
