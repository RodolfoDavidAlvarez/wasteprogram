"use client"

import { useId, useState, useEffect } from "react"

interface TabsProps {
  tabs: Array<{
    label: string
    value: string
    content: React.ReactNode
  }>
  defaultValue?: string
  persistKey?: string // localStorage key to persist active tab
}

export function Tabs({ tabs, defaultValue, persistKey }: TabsProps) {
  // Initialize from localStorage if persistKey is provided
  const getInitialTab = () => {
    if (persistKey && typeof window !== "undefined") {
      const saved = localStorage.getItem(persistKey)
      if (saved && tabs.some((t) => t.value === saved)) {
        return saved
      }
    }
    return defaultValue || tabs[0]?.value
  }

  const [activeTab, setActiveTab] = useState(getInitialTab)

  // Persist to localStorage when tab changes
  useEffect(() => {
    if (persistKey && activeTab) {
      localStorage.setItem(persistKey, activeTab)
    }
  }, [persistKey, activeTab])
  const baseId = useId()

  return (
    <div className="w-full">
      {/* Scrollable wrapper for mobile */}
      <div className="overflow-x-auto -mx-1 px-1 scrollbar-hide">
        <div
          className="flex w-full items-center gap-1 rounded-xl border border-border bg-background/70 backdrop-blur p-1 shadow-sm min-w-max sm:min-w-0"
          role="tablist"
          aria-label="Tabs"
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
                "relative min-w-[72px] sm:min-w-[100px] flex-1 select-none whitespace-nowrap rounded-lg px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition",
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
                  className="pointer-events-none absolute inset-x-2 sm:inset-x-3 -bottom-[5px] sm:-bottom-[6px] h-0.5 sm:h-1 rounded-full bg-gradient-to-r from-primary to-[hsl(var(--ring))]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        className="mt-5"
        role="tabpanel"
        id={`${baseId}-${activeTab}-panel`}
        aria-labelledby={`${baseId}-${activeTab}-tab`}
      >
        {tabs.find((tab) => tab.value === activeTab)?.content}
      </div>
    </div>
  )
}
