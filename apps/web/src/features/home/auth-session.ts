"use client";

import { getBrowserSupabaseClient } from "./integration-provider";

export const localSessionKey = "zac.local.session";
export const localProfileKey = "zac.local.profile";
export const authSessionChangedEvent = "zac.auth.changed";

export async function signOutCurrentUser() {
  const supabase = getBrowserSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  window.localStorage.removeItem(localSessionKey);
  window.localStorage.removeItem(localProfileKey);
  window.dispatchEvent(new Event(authSessionChangedEvent));
}
