"use client";

import dynamic from "next/dynamic";

// Dynamically import the weigh ticket page to avoid SSR issues
const WeighTicketPage = dynamic(() => import("@/app/resources/weigh-ticket/page").then((mod) => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-gray-500">Loading weigh ticket form...</div>
    </div>
  ),
});

export function WeighTicketTab() {
  return (
    <div className="w-full">
      <WeighTicketPage />
    </div>
  );
}

