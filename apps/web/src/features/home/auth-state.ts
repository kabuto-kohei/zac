"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "./integration-provider";
import { authSessionChangedEvent, localSessionKey } from "./auth-session";

export function useAuthStatus() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        if (active) {
          setAuthenticated(Boolean(window.localStorage.getItem(localSessionKey)));
          setChecking(false);
        }
        return;
      }

      const session = await supabase.auth.getSession();

      if (active) {
        setAuthenticated(Boolean(session.data.session?.access_token));
        setChecking(false);
      }
    }

    function handleAuthSessionChange() {
      void load();
    }

    void load();
    window.addEventListener(authSessionChangedEvent, handleAuthSessionChange);

    return () => {
      active = false;
      window.removeEventListener(authSessionChangedEvent, handleAuthSessionChange);
    };
  }, []);

  return { authenticated, checking };
}
