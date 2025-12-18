"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TruckIcon, CheckCircle2, CircleDot } from "lucide-react";

type LoadItem = {
  id: string;
  loadNumber: number;
  dateStr: string;
  vrNumber?: string | null;
  statusTag?: "scheduled" | "delayed" | "moved" | "arrived" | null;
  isDelivered: boolean;
  isToday: boolean;
  scheduledDate: Date | string;
};

interface DeliveryChartProps {
  loads: LoadItem[];
}

type DayData = {
  date: string;
  dayLabel: string;
  delivered: number;
  scheduled: number;
  total: number;
  isToday: boolean;
  loads: LoadItem[];
};

export function DeliveryChart({ loads }: DeliveryChartProps) {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  // Calculate last 7 days data
  const chartData = useMemo(() => {
    const now = new Date();
    const data: DayData[] = [];

    // Get the last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dateStr = date.toISOString().split("T")[0];
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = date.getDate();
      const isToday = i === 0;

      // Filter loads for this day
      const dayLoads = loads.filter((load) => {
        const loadDate = new Date(load.scheduledDate);
        loadDate.setHours(0, 0, 0, 0);
        return loadDate.getTime() === date.getTime();
      });

      const delivered = dayLoads.filter((l) => l.isDelivered).length;
      const scheduled = dayLoads.filter((l) => !l.isDelivered).length;

      data.push({
        date: dateStr,
        dayLabel: isToday ? "Today" : `${dayLabel} ${dayNum}`,
        delivered,
        scheduled,
        total: delivered + scheduled,
        isToday,
        loads: dayLoads,
      });
    }

    return data;
  }, [loads]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const delivered = payload.find((p) => p.dataKey === "delivered")?.value || 0;
      const scheduled = payload.find((p) => p.dataKey === "scheduled")?.value || 0;
      const total = delivered + scheduled;

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-gray-600">Delivered:</span>
              <span className="font-medium">{delivered}</span>
            </div>
            {scheduled > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-400" />
                <span className="text-gray-600">Scheduled:</span>
                <span className="font-medium">{scheduled}</span>
              </div>
            )}
            <div className="border-t pt-1 mt-1">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold ml-2">{total} truck loads</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: DayData) => {
    if (data.total > 0) {
      setSelectedDay(selectedDay?.date === data.date ? null : data);
    }
  };

  // Check if there's any data in the last 7 days
  const hasData = chartData.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <TruckIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Last 7 Days</h3>
        </div>
        <div className="text-center py-8 text-gray-400">
          <TruckIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No deliveries in the last 7 days</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TruckIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Last 7 Days</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-gray-600">Delivered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400" />
            <span className="text-gray-600">Scheduled</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onClick={(data) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const payload = (data as any)?.activePayload?.[0]?.payload as DayData | undefined;
              if (payload) {
                handleBarClick(payload);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="dayLabel"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
            <Bar
              dataKey="delivered"
              stackId="a"
              fill="#10B981"
              radius={[0, 0, 0, 0]}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-delivered-${index}`}
                  fill={entry.isToday ? "#059669" : "#10B981"}
                  opacity={selectedDay && selectedDay.date !== entry.date ? 0.4 : 1}
                />
              ))}
            </Bar>
            <Bar
              dataKey="scheduled"
              stackId="a"
              fill="#FBBF24"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-scheduled-${index}`}
                  fill={entry.isToday ? "#D97706" : "#FBBF24"}
                  opacity={selectedDay && selectedDay.date !== entry.date ? 0.4 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail Panel (when a day is selected) */}
      {selectedDay && selectedDay.loads.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900">{selectedDay.dayLabel}</span>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div className="space-y-2">
            {selectedDay.loads.map((load) => (
              <div
                key={load.id}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-mono text-xs">#{load.loadNumber}</span>
                  <span className="font-mono font-medium">
                    {load.vrNumber || <span className="text-gray-400 italic">VR Pending</span>}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {load.isDelivered ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Delivered</span>
                    </>
                  ) : (
                    <>
                      <CircleDot className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-600 font-medium">Scheduled</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tap hint on mobile */}
      <p className="text-[10px] text-gray-400 text-center mt-3 sm:hidden">
        Tap a bar to see details
      </p>
    </div>
  );
}
