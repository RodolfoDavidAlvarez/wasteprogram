"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Truck, Upload, X, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  client?: { companyName: string };
};

interface TodayViewProps {
  loads: LoadItem[];
  todayDateStr: string;
}

export function TodayView({ loads, todayDateStr }: TodayViewProps) {
  const [selectedLoad, setSelectedLoad] = useState<LoadItem | null>(null);

  const todayDelivered = loads.filter((l) => l.isDelivered).length;
  const todayPending = loads.length - todayDelivered;

  return (
    <div className="space-y-6">
      {/* Today Header */}
      <div className="text-center py-4 sm:py-6">
        <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide mb-1">Today</div>
        <div className="text-xl sm:text-2xl font-bold text-gray-900">{todayDateStr}</div>
      </div>

      {loads.length === 0 ? (
        /* No loads today */
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No deliveries scheduled for today</p>
          <p className="text-sm text-gray-400 mt-1">Check the Overview tab for upcoming loads</p>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-emerald-600">{todayDelivered}</div>
              <div className="text-xs sm:text-sm text-emerald-700 font-medium mt-1">Delivered</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-amber-600">{todayPending}</div>
              <div className="text-xs sm:text-sm text-amber-700 font-medium mt-1">Pending</div>
            </div>
          </div>

          {/* Today's Loads */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Today&apos;s Loads ({loads.length})
            </h3>
            {loads.map((load) => (
              <div
                key={load.id}
                onClick={() => setSelectedLoad(load)}
                className={`rounded-xl border-2 p-4 transition-all cursor-pointer active:scale-[0.99] ${
                  load.isDelivered
                    ? "bg-emerald-50 border-emerald-300 hover:border-emerald-400"
                    : "bg-white border-gray-200 hover:border-blue-400 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* VR Number - Big and Bold */}
                    <div className="flex items-center gap-2 mb-2">
                      {load.isDelivered ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      )}
                      <span className="font-mono text-lg sm:text-xl font-bold text-gray-900">
                        {load.vrNumber ? `VR ${load.vrNumber}` : "VR# Pending"}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className={`font-medium ${load.isDelivered ? "text-emerald-700" : "text-amber-600"}`}>
                        {load.isDelivered ? (load.statusTag === "moved" ? "Delivered (rescheduled)" : "Delivered") : "Scheduled"}
                      </span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-600">20 tons</span>
                      {load.eta && !load.isDelivered && (
                        <>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-600">ETA {load.eta}</span>
                        </>
                      )}
                    </div>

                    {/* Notes */}
                    {load.note && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-2">{load.note}</p>
                    )}
                  </div>

                  {/* Load Number & Status Badge */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-gray-400">Load</span>
                      <div className="text-lg font-bold text-gray-400">#{load.loadNumber}</div>
                    </div>

                    {load.isDelivered ? (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600">
                        Tap to update
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Day Total */}
          <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Today&apos;s Total</span>
            <span className="text-lg font-bold text-gray-900">{loads.length * 20} tons</span>
          </div>
        </>
      )}

      {/* Load Detail Modal */}
      <Dialog open={selectedLoad !== null} onOpenChange={() => setSelectedLoad(null)}>
        <DialogContent className="max-w-md mx-2 sm:mx-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {selectedLoad?.vrNumber ? `VR ${selectedLoad.vrNumber}` : "Load Details"}
            </DialogTitle>
          </DialogHeader>

          {selectedLoad && (
            <div className="space-y-6 pt-2">
              {/* Load Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500">Load #</span>
                  <span className="font-bold text-gray-900">{selectedLoad.loadNumber}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500">VR Number</span>
                  <span className="font-mono font-bold text-gray-900">
                    {selectedLoad.vrNumber || "Pending"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-semibold ${selectedLoad.isDelivered ? "text-emerald-600" : "text-amber-600"}`}>
                    {selectedLoad.isDelivered ? "Delivered" : "Scheduled"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500">Tonnage</span>
                  <span className="font-bold text-gray-900">20 tons</span>
                </div>
                {selectedLoad.eta && !selectedLoad.isDelivered && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">ETA</span>
                    <span className="font-semibold text-gray-900">{selectedLoad.eta}</span>
                  </div>
                )}
                {selectedLoad.note && (
                  <div className="py-2">
                    <span className="text-gray-500 text-sm">Notes</span>
                    <p className="text-gray-900 mt-1">{selectedLoad.note}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedLoad.isDelivered ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-semibold text-emerald-700">This load has been delivered</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Unloaded Button */}
                  <button
                    disabled
                    className="w-full py-4 px-6 rounded-xl bg-blue-100 border-2 border-blue-300 text-blue-400 font-semibold text-lg flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Truck className="h-5 w-5" />
                    Mark as Unloaded
                  </button>
                  <p className="text-xs text-blue-400 text-center font-medium">Coming Soon</p>

                  {/* Upload Documentation - Coming Soon */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-medium text-gray-400">Upload Documentation</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Weight ticket, BOL, or other shipment docs
                    </p>
                    <p className="text-xs text-blue-400 mt-2 font-medium">Coming Soon</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
