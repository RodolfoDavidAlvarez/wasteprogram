"use client";

import { useState, useEffect, useId } from "react";
import Image from "next/image";
import { LoginButton } from "@/components/layout/LoginButton";

interface Tab {
  label: string;
  value: string;
}

interface ScheduleNavigationProps {
  tabs: Tab[];
  defaultTab?: string;
  persistKey?: string;
}

export function ScheduleNavigation({ tabs, defaultTab = "today", persistKey = "schedule-active-tab" }: ScheduleNavigationProps) {
  // Initialize with default - no localStorage access during initial render
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value);
  const [mounted, setMounted] = useState(false);
  const baseId = useId();

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

  // Persist to localStorage when tab changes
  useEffect(() => {
    if (mounted && persistKey && activeTab) {
      localStorage.setItem(persistKey, activeTab);
    }
  }, [mounted, persistKey, activeTab]);

  // Listen for changes from other components
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem(persistKey);
      if (saved && tabs.some((t) => t.value === saved)) {
        setActiveTab(saved);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Also check periodically for same-tab changes
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [persistKey, tabs]);

  return (
    <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6 py-3 sm:py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="inline-flex items-center rounded-lg bg-card shadow-sm ring-1 ring-black/5 px-2 sm:px-3 py-1.5 sm:py-2">
              <div className="relative h-8 sm:h-10 aspect-[2083/729]">
                <Image
                  src="/ssw-logo.png"
                  alt="Soil Seed & Water"
                  fill
                  priority
                  unoptimized
                  sizes="(min-width: 640px) 120px, 96px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="flex-shrink-0 min-w-0 hidden sm:block">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
              Waste Scheduled Delivery
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex-1 min-w-0">
            <div className="w-full">
              {/* Scrollable wrapper for mobile */}
              <div className="overflow-x-auto -mx-1 px-1 scrollbar-hide">
                <div
                  className="flex w-full items-center gap-1 rounded-xl border border-border bg-background/70 backdrop-blur p-1 shadow-sm min-w-max sm:min-w-0"
                  role="tablist"
                  aria-label="Navigation Tabs"
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.value}
                      aria-controls={`${baseId}-${tab.value}-panel`}
                      id={`${baseId}-${tab.value}-tab`}
                      className={[
                        "relative min-w-[72px] sm:min-w-[100px] flex-1 select-none whitespace-nowrap rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                        activeTab === tab.value
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-card/80 hover:text-foreground",
                      ].join(" ")}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        {tab.label}
                      </span>
                      {activeTab === tab.value && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-2 sm:inset-x-3 -bottom-[3px] sm:-bottom-[4px] h-0.5 sm:h-1 rounded-full bg-gradient-to-r from-primary to-[hsl(var(--ring))]"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <div className="flex-shrink-0">
            <LoginButton />
          </div>
        </div>
      </div>
    </div>
  );
}

