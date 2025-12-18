"use client"

import { useId, useState } from "react"

interface TabsProps {
  tabs: Array<{
    label: string
    value: string
    content: React.ReactNode
  }>
  defaultValue?: string
}

export function Tabs({ tabs, defaultValue }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value)
  const baseId = useId()

  return (
    <div className="w-full">
      <div
        className="flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-border bg-background/70 backdrop-blur p-1 shadow-sm"
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
              "relative min-w-[120px] flex-1 select-none whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition",
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
                className="pointer-events-none absolute inset-x-3 -bottom-[6px] h-1 rounded-full bg-gradient-to-r from-primary to-[hsl(var(--ring))]"
              />
            )}
          </button>
        ))}
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
