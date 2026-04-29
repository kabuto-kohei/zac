import { eq, userProfiles, userSettings, users } from "@zac/db";
import type { OnboardingProfileInput, UserProfileSummary } from "@zac/shared";
import type { RequestActor } from "../auth.js";
import { getDatabase } from "../integrations/database.js";

const memoryProfiles = new Map<string, UserProfileSummary>();

export async function getCurrentProfile(actor: RequestActor) {
  const db = getDatabase();

  if (!db) {
    return memoryProfiles.get(actor.userId) ?? null;
  }

  const [row] = await db
    .select({
      userId: users.id,
      email: users.email,
      displayName: userProfiles.displayName,
      homeArea: userProfiles.homeArea,
      climbingExperience: userProfiles.climbingExperience,
      defaultPlanVisibility: userSettings.defaultPlanVisibility,
      allowLocation: userSettings.allowLocation,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .where(eq(users.id, actor.userId))
    .limit(1);

  if (!row?.displayName) {
    return null;
  }

  return {
    userId: row.userId,
    email: row.email,
    displayName: row.displayName,
    discipline: "boulder",
    experience: parseExperience(row.climbingExperience),
    area: row.homeArea ?? "",
    defaultVisibility: row.defaultPlanVisibility ?? "followers",
    locationEnabled: false,
  } satisfies UserProfileSummary;
}

export async function upsertCurrentProfile(actor: RequestActor, input: OnboardingProfileInput) {
  const profile = {
    userId: actor.userId,
    email: actor.email,
    displayName: input.displayName,
    discipline: input.discipline,
    experience: input.experience,
    area: input.area,
    defaultVisibility: input.defaultVisibility,
    locationEnabled: false,
  } satisfies UserProfileSummary;

  const db = getDatabase();

  if (!db) {
    memoryProfiles.set(actor.userId, profile);
    return profile;
  }

  await db
    .insert(userProfiles)
    .values({
      userId: actor.userId,
      displayName: input.displayName,
      homeArea: input.area,
      climbingExperience: input.experience,
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        displayName: input.displayName,
        homeArea: input.area,
        climbingExperience: input.experience,
        updatedAt: new Date(),
      },
    });

  await db
    .insert(userSettings)
    .values({
      userId: actor.userId,
      defaultPlanVisibility: input.defaultVisibility,
      allowLocation: false,
    })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: {
        defaultPlanVisibility: input.defaultVisibility,
        allowLocation: false,
        updatedAt: new Date(),
      },
    });

  return profile;
}

function parseExperience(value: string | null): UserProfileSummary["experience"] {
  return value === "intermediate" || value === "advanced" ? value : "beginner";
}
