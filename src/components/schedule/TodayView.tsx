"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Truck, ChevronLeft, ChevronRight, Camera, Image as ImageIcon, Loader2 } from "lucide-react";
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
  allLoads: LoadItem[];
}

type DeliveryRecordUi = {
  vrNumber: string;
  status: "scheduled" | "delivered" | string;
  deliveredAt: string | null;
  photoUrls: string[];
};

export function TodayView({ allLoads }: TodayViewProps) {
  const router = useRouter();
  const [selectedLoad, setSelectedLoad] = useState<LoadItem | null>(null);
  const [dayOffset, setDayOffset] = useState(0);
  const [deliveryRecord, setDeliveryRecord] = useState<DeliveryRecordUi | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate the selected date based on offset (Arizona timezone)
  const selectedDate = useMemo(() => {
    const nowAZ = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" }));
    const date = new Date(nowAZ.getFullYear(), nowAZ.getMonth(), nowAZ.getDate());
    date.setDate(date.getDate() + dayOffset);
    return date;
  }, [dayOffset]);

  // Format the selected date for display
  const dateStr = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Filter loads for the selected day
  // For today (offset 0), use the pre-calculated isToday flag to avoid timezone issues
  // For other days, compare the dateStr which is already formatted consistently
  const loads = useMemo(() => {
    if (dayOffset === 0) {
      // Use the server-calculated isToday flag
      return allLoads.filter((load) => load.isToday);
    }
    // For other days, compare the formatted date string
    const targetDateStr = selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return allLoads.filter((load) => load.dateStr === targetDateStr);
  }, [allLoads, dayOffset, selectedDate]);

  // Determine label (Today, Yesterday, Tomorrow, or just date)
  const dayLabel = useMemo(() => {
    if (dayOffset === 0) return "Today";
    if (dayOffset === -1) return "Yesterday";
    if (dayOffset === 1) return "Tomorrow";
    return selectedDate.toLocaleDateString("en-US", { weekday: "long" });
  }, [dayOffset, selectedDate]);

  const todayDelivered = loads.filter((l) => l.isDelivered).length;
  const todayPending = loads.length - todayDelivered;

  // Fetch delivery record when load is selected
  useEffect(() => {
    if (selectedLoad?.vrNumber) {
      fetch(`/api/schedule/delivery-record/${selectedLoad.vrNumber}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.record) {
            setDeliveryRecord(data.record);
            setPhotos(data.record.photoUrls || []);
          } else {
            setDeliveryRecord(null);
            setPhotos([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching delivery record:", error);
        });
    } else {
      setDeliveryRecord(null);
      setPhotos([]);
    }
  }, [selectedLoad?.vrNumber]);

  // Handle photo upload
  const handlePhotoUpload = async (file: File) => {
    if (!selectedLoad?.vrNumber) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("vrNumber", selectedLoad.vrNumber);

      const response = await fetch("/api/schedule/upload-photo", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setPhotos((prev) => [...prev, data.photoUrl]);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle camera/file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  // Handle mark as delivered
  const handleMarkDelivered = async () => {
    if (!selectedLoad?.vrNumber) return;

    const confirmed = confirm("Mark this load as delivered?");
    if (!confirmed) return;

    setMarking(true);
    try {
      // Ensure delivery record exists first
      if (!deliveryRecord) {
        await fetch(`/api/schedule/delivery-record/${selectedLoad.vrNumber}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vrNumber: selectedLoad.vrNumber,
            loadNumber: selectedLoad.loadNumber,
            scheduledDate: selectedLoad.scheduledDate,
            tonnage: 20,
          }),
        });
      }

      // Mark as delivered
      const response = await fetch("/api/schedule/mark-delivered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vrNumber: selectedLoad.vrNumber,
          deliveredBy: "Field Team",
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state optimistically
        setDeliveryRecord(data.record);
        // Close modal
        setSelectedLoad(null);
        // Show success message
        alert("Load marked as delivered successfully!");
      }
    } catch (error) {
      console.error("Error marking as delivered:", error);
      alert("Failed to mark as delivered. Please try again.");
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Day Header with Navigation */}
      <div className="flex items-center justify-between py-4 sm:py-6">
        {/* Previous Day Button */}
        <button
          onClick={() => setDayOffset((d) => d - 1)}
          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </button>

        {/* Date Display */}
        <div className="text-center flex-1 px-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">{dayLabel}</span>
            {dayOffset !== 0 && (
              <button
                onClick={() => setDayOffset(0)}
                className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium"
              >
                Back to Today
              </button>
            )}
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">{dateStr}</div>
        </div>

        {/* Next Day Button */}
        <button
          onClick={() => setDayOffset((d) => d + 1)}
          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </button>
      </div>

      {loads.length === 0 ? (
        /* No loads for selected day */
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No deliveries scheduled for {dayOffset === 0 ? "today" : dateStr}</p>
          <p className="text-sm text-gray-400 mt-1">Use the arrows to check other days or see the Overview tab</p>
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

          {/* Day's Loads */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {dayLabel}&apos;s Loads ({loads.length})
            </h3>
            {loads.map((load) => (
              <div
                key={load.id}
                onClick={() => {
                  if (load.vrNumber) {
                    router.push(`/schedule/records/${encodeURIComponent(load.vrNumber)}`);
                    return;
                  }
                  setSelectedLoad(load);
                }}
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
                    {load.note && <p className="text-xs sm:text-sm text-gray-500 mt-2">{load.note}</p>}
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
            <span className="font-semibold text-gray-700">{dayLabel}&apos;s Total</span>
            <span className="text-lg font-bold text-gray-900">{loads.length * 20} tons</span>
          </div>
        </>
      )}

      {/* Load Detail Modal */}
      <Dialog
        open={selectedLoad !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedLoad(null);
        }}
      >
        <DialogContent className="max-w-md mx-2 sm:mx-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{selectedLoad?.vrNumber ? `VR ${selectedLoad.vrNumber}` : "Load Details"}</DialogTitle>
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
                  <span className="font-mono font-bold text-gray-900">{selectedLoad.vrNumber || "Pending"}</span>
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
              {selectedLoad.isDelivered || deliveryRecord?.status === "delivered" ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-semibold text-emerald-700">This load has been delivered</p>
                  {deliveryRecord?.deliveredAt && (
                    <p className="text-xs text-emerald-600 mt-1">{new Date(deliveryRecord.deliveredAt).toLocaleString()}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Photo Documentation */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Take Photo Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || !selectedLoad.vrNumber}
                      className="py-3 px-4 rounded-lg bg-blue-50 border-2 border-blue-200 text-blue-700 font-semibold flex items-center justify-center gap-2 hover:bg-blue-100 active:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                      <span className="text-sm">Take Photo</span>
                    </button>

                    {/* View Photos Button */}
                    <button
                      onClick={() => setShowPhotos(true)}
                      disabled={photos.length === 0}
                      className="py-3 px-4 rounded-lg bg-gray-50 border-2 border-gray-200 text-gray-700 font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-sm">Photos {photos.length > 0 && `(${photos.length})`}</span>
                    </button>
                  </div>

                  {/* Hidden file input */}
                  <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />

                  {/* Mark as Delivered Button */}
                  <button
                    onClick={handleMarkDelivered}
                    disabled={marking || !selectedLoad.vrNumber}
                    className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                  >
                    {marking ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Marking as Delivered...
                      </>
                    ) : (
                      <>
                        <Truck className="h-5 w-5" />
                        Mark as Delivered
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">Photos are optional. You can mark as delivered without documentation.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Gallery Dialog */}
      <Dialog open={showPhotos} onOpenChange={setShowPhotos}>
        <DialogContent className="max-w-2xl mx-2 sm:mx-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>Delivery Photos ({photos.length})</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-2">
            {photos.map((photoUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={photoUrl}
                  alt={`Delivery photo ${index + 1}`}
                  className="w-full h-auto rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => window.open(photoUrl, "_blank")}
                />
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Photo {index + 1}</div>
              </div>
            ))}
          </div>
          {photos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No photos uploaded yet</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
