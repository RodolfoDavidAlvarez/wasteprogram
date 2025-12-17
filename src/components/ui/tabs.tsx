"use client"

import { useState } from "react"

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

  return (
    <div>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab.value
                ? "text-emerald-600 border-emerald-600"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tabs.find((tab) => tab.value === activeTab)?.content}
      </div>
    </div>
  )
}
