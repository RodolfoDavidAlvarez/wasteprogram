"use client";

import { useState } from "react";
import { CheckCircle2, CircleDot, List, LayoutGrid } from "lucide-react";

type LoadItem = {
  id: string;
  loadNumber: number;
  dateStr: string;
  vrNumber?: string | null;
  statusTag?: "scheduled" | "delayed" | "moved" | "arrived" | null;
  note?: string | null;
  eta?: string | null;
  isDelivered: boolean;
  isToday: boolean;
  scheduledDate: Date | string;
};

interface OverviewTableProps {
  loads: LoadItem[];
  tonsPerLoad?: number;
}

export function OverviewTable({ loads, tonsPerLoad = 20 }: OverviewTableProps) {
  const [groupByDay, setGroupByDay] = useState(false);

  // Group loads by date
  const loadsByDate: Record<string, LoadItem[]> = {};
  loads.forEach((load) => {
    const dateKey = load.dateStr;
    if (!loadsByDate[dateKey]) loadsByDate[dateKey] = [];
    loadsByDate[dateKey].push(load);
  });

  if (groupByDay) {
    return (
      <div>
        {/* Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">All Loads</h3>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setGroupByDay(false)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                !groupByDay ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setGroupByDay(true)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                groupByDay ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">By Day</span>
            </button>
          </div>
        </div>

        {/* Grouped by Day View */}
        <div className="space-y-6">
          {Object.entries(loadsByDate).map(([dateStr, dayLoads]) => {
            const dayTons = dayLoads.length * tonsPerLoad;
            const deliveredCount = dayLoads.filter((l) => l.isDelivered).length;
            const isToday = dayLoads.some((l) => l.isToday);

            return (
              <div
                key={dateStr}
                className={`border rounded-lg overflow-hidden ${isToday ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}
              >
                {/* Day Header */}
                <div className={`px-4 py-3 flex flex-wrap items-center justify-between gap-2 ${isToday ? "bg-blue-100" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isToday ? "text-blue-700" : "text-gray-900"}`}>{dateStr}</span>
                    {isToday && <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-medium">TODAY</span>}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      {dayLoads.length} load{dayLoads.length > 1 ? "s" : ""}
                    </span>
                    <span className="font-medium text-gray-900">{dayTons} tons</span>
                    {deliveredCount > 0 && (
                      <span className="text-emerald-600 font-medium">
                        {deliveredCount}/{dayLoads.length} delivered
                      </span>
                    )}
                  </div>
                </div>

                {/* Day Loads */}
                <div className="divide-y divide-gray-100">
                  {dayLoads.map((load) => (
                    <div key={load.id} className="px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                      <span className="text-gray-400 font-mono text-sm w-8">#{load.loadNumber}</span>
                      <span className="font-mono text-sm min-w-[100px]">
                        {load.vrNumber || <span className="text-gray-400 italic">Pending</span>}
                      </span>
                      <span className="text-sm text-gray-600">{tonsPerLoad} tons</span>
                      {load.isDelivered ? (
                        <span className="inline-flex items-center text-emerald-700 text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Delivered
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber-600 text-sm font-medium">
                          <CircleDot className="h-4 w-4 mr-1" />
                          Scheduled
                        </span>
                      )}
                      {load.note && <span className="text-xs text-gray-500 flex-1">{load.note}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // List View (default) - Cards on mobile, table on desktop
  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">All Loads</h3>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setGroupByDay(false)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              !groupByDay ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            onClick={() => setGroupByDay(true)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              groupByDay ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">By Day</span>
          </button>
        </div>
      </div>

      {/* Mobile: Card Layout */}
      <div className="sm:hidden space-y-3">
        {loads.map((load) => (
          <div
            key={load.id}
            className={`rounded-lg border p-3 ${
              load.isToday
                ? "bg-blue-50 border-blue-200"
                : load.isDelivered
                  ? "bg-gray-50 border-gray-200"
                  : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400 font-mono">#{load.loadNumber}</span>
                  <span className={`text-sm font-medium ${load.isToday ? "text-blue-700" : "text-gray-900"}`}>
                    {load.dateStr}
                  </span>
                  {load.isToday && (
                    <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-medium">TODAY</span>
                  )}
                </div>
                <div className="font-mono text-sm text-gray-900">
                  {load.vrNumber || <span className="text-gray-400 italic">VR Pending</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-500">{tonsPerLoad}t</span>
                {load.isDelivered ? (
                  <span className="inline-flex items-center text-emerald-700 text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3 mr-0.5" />
                    Done
                  </span>
                ) : (
                  <span className="inline-flex items-center text-amber-600 text-xs font-medium">
                    <CircleDot className="h-3 w-3 mr-0.5" />
                    Sched
                  </span>
                )}
              </div>
            </div>
            {(load.note || load.eta) && (
              <p className="text-xs text-gray-500 mt-2 truncate">{load.note || `ETA ${load.eta}`}</p>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-2 font-semibold text-gray-600">#</th>
              <th className="text-left py-3 px-2 font-semibold text-gray-600">Date</th>
              <th className="text-left py-3 px-2 font-semibold text-gray-600">VR Number</th>
              <th className="text-left py-3 px-2 font-semibold text-gray-600">Status</th>
              <th className="text-left py-3 px-2 font-semibold text-gray-600">Tonnage</th>
              <th className="text-left py-3 px-2 font-semibold text-gray-600 hidden md:table-cell">Notes</th>
            </tr>
          </thead>
          <tbody>
            {loads.map((load) => (
              <tr
                key={load.id}
                className={`border-b border-gray-100 ${load.isToday ? "bg-blue-50" : load.isDelivered ? "bg-gray-50" : ""}`}
              >
                <td className="py-3 px-2 text-gray-400 font-mono">{load.loadNumber}</td>
                <td className="py-3 px-2">
                  <span className={load.isToday ? "font-bold text-blue-700" : load.isDelivered ? "text-gray-700" : "font-medium text-gray-900"}>
                    {load.dateStr}
                  </span>
                  {load.isToday && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">TODAY</span>
                  )}
                </td>
                <td className="py-3 px-2 font-mono">
                  {load.vrNumber ? (
                    <span className="text-gray-900">{load.vrNumber}</span>
                  ) : (
                    <span className="text-gray-400 italic">Pending</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  {load.isDelivered ? (
                    <span className="inline-flex items-center text-emerald-700 font-medium">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {load.statusTag === "moved" ? "Delivered (moved)" : "Delivered"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-amber-600 font-medium">
                      <CircleDot className="h-4 w-4 mr-1" />
                      Scheduled
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-gray-700 font-medium">{tonsPerLoad} tons</td>
                <td className="py-3 px-2 text-gray-500 text-xs hidden md:table-cell">
                  {load.note || (load.eta ? `ETA ${load.eta}` : "")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
