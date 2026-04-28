import { users } from "@zac/db";
import { getDatabase } from "./integrations/database.js";
import { getSupabaseAdminClient } from "./integrations/supabase.js";

export type RequestActor = {
  userId: string;
  email: string | null;
};

export async function resolveRequestActor(authorization: string | null | undefined): Promise<RequestActor | null> {
  const token = extractBearerToken(authorization);

  if (!token) {
    return null;
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  const actor = {
    userId: data.user.id,
    email: data.user.email ?? null,
  } satisfies RequestActor;

  await ensureUser(actor);
  return actor;
}

function extractBearerToken(authorization: string | null | undefined) {
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

async function ensureUser(actor: RequestActor) {
  const db = getDatabase();

  if (!db) {
    return;
  }

  await db
    .insert(users)
    .values({
      id: actor.userId,
      email: actor.email,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: actor.email,
        updatedAt: new Date(),
      },
    });
}
