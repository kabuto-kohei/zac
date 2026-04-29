"use client";

import { useEffect, useState } from "react";

export function useLocalToggle(key: string, initialValue = false) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const stored = window.localStorage.getItem(key);
    if (stored === "true" || stored === "false") {
      setValue(stored === "true");
    }
  }, [key]);

  function toggle() {
    setValue((current) => {
      const next = !current;
      window.localStorage.setItem(key, String(next));
      return next;
    });
  }

  return [value, toggle] as const;
}
