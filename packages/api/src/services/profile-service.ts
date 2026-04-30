import { eq, userProfiles, userSettings, users } from "@zac/db";
import type { OnboardingProfileInput, UpdateProfileSettingsInput, UserProfileSummary } from "@zac/shared";
import type { RequestActor } from "../auth.js";
import { ApiError } from "../errors.js";
import { getDatabase } from "../integrations/database.js";
import { isRuntimeFallbackAllowed } from "../integrations/env.js";

const memoryProfiles = new Map<string, UserProfileSummary>();

export async function getCurrentProfile(actor: RequestActor) {
  const db = getDatabase();

  if (!db) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Database is required for profile.", 503);
    }
    return memoryProfiles.get(actor.userId) ?? null;
  }

  const [userRow] = await db.select().from(users).where(eq(users.id, actor.userId)).limit(1);
  const [profileRow] = await db.select().from(userProfiles).where(eq(userProfiles.userId, actor.userId)).limit(1);
  const [settingsRow] = await db.select().from(userSettings).where(eq(userSettings.userId, actor.userId)).limit(1);

  if (!userRow || !profileRow?.displayName) {
    return null;
  }

  return {
    userId: userRow.id,
    email: userRow.email,
    displayName: profileRow.displayName,
    discipline: "boulder",
    experience: parseExperience(profileRow.climbingExperience),
    area: profileRow.homeArea ?? "",
    defaultVisibility: settingsRow?.defaultPlanVisibility ?? "followers",
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
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Database is required for profile.", 503);
    }
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

export async function updateCurrentSettings(actor: RequestActor, input: UpdateProfileSettingsInput) {
  const db = getDatabase();
  const current = memoryProfiles.get(actor.userId);

  if (!db) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Database is required for settings.", 503);
    }

    if (current) {
      const next = {
        ...current,
        defaultVisibility: input.defaultVisibility,
        locationEnabled: false,
      } satisfies UserProfileSummary;
      memoryProfiles.set(actor.userId, next);
      return next;
    }

    return null;
  }

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

  return getCurrentProfile(actor);
}

function parseExperience(value: string | null): UserProfileSummary["experience"] {
  return value === "intermediate" || value === "advanced" ? value : "beginner";
}
