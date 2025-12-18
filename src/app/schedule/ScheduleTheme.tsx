"use client";

import { useEffect } from "react";

export function ScheduleTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("schedule-theme");
    return () => {
      root.classList.remove("schedule-theme");
    };
  }, []);

  return null;
}

