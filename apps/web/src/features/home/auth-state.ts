"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "./integration-provider";

const sessionKey = "zac.local.session";

export function useAuthStatus() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        if (active) {
          setAuthenticated(Boolean(window.localStorage.getItem(sessionKey)));
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

    void load();

    return () => {
      active = false;
    };
  }, []);

  return { authenticated, checking };
}

