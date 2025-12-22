"use client";

import { useState, useEffect } from "react";

interface TabContent {
  label: string;
  value: string;
  content: React.ReactNode;
}

interface ScheduleContentProps {
  tabs: TabContent[];
  persistKey?: string;
  defaultTab?: string;
}

export function ScheduleContent({ tabs, persistKey = "schedule-active-tab", defaultTab = "today" }: ScheduleContentProps) {
  // Initialize with default - no localStorage access during initial render
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    setMounted(true);
    if (persistKey && typeof window !== "undefined") {
      const saved = localStorage.getItem(persistKey);
      if (saved && tabs.some((t) => t.value === saved)) {
        setActiveTab(saved);
      }
    }
  }, [persistKey, tabs]);

  // Listen for changes from navigation
  useEffect(() => {
    if (!mounted) return;

    const handleStorageChange = () => {
      const saved = localStorage.getItem(persistKey);
      if (saved && tabs.some((t) => t.value === saved)) {
        setActiveTab(saved);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Also check periodically for same-tab changes (since storage event only fires across tabs)
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [mounted, persistKey, tabs]);

  return <>{tabs.find((tab) => tab.value === activeTab)?.content}</>;
}

