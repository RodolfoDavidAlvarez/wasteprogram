"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { CheckCircle2, Clock, Truck, ChevronLeft, ChevronRight, X, RotateCcw } from "lucide-react";
import { DeliveryRecordSidebar } from "./DeliveryRecordSidebar";

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
  deliveryType?: string;
};

type PhotoData = {
  photoUrls: string[];
  photoCount: number;
  status: string;
  deliveredAt: string | null;
  loadNumber: number;
  notes: string | null;
  weightTicketUrls: string[];
};

interface TodayViewProps {
  allLoads: LoadItem[];
  photosByVr?: Record<string, PhotoData>;
}

export function TodayView({ allLoads, photosByVr = {} }: TodayViewProps) {
  const [selectedVrNumber, setSelectedVrNumber] = useState<string | null>(null);
  const [dayOffset, setDayOffset] = useState(0);

  // Photo lightbox state
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [photoRotations, setPhotoRotations] = useState<Record<string, number>>({});

  // Load saved rotations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("photoRotations");
    if (saved) {
      setPhotoRotations(JSON.parse(saved));
    }
  }, []);

  // Save rotations to localStorage whenever they change
  const saveRotation = (photoUrl: string, rotation: number) => {
    const newRotations = { ...photoRotations, [photoUrl]: rotation };
    setPhotoRotations(newRotations);
    localStorage.setItem("photoRotations", JSON.stringify(newRotations));
  };

  const handleRotateLeft = () => {
    const currentPhoto = lightboxPhotos[lightboxIndex];
    const currentRotation = photoRotations[currentPhoto] || 0;
    const newRotation = (currentRotation - 90 + 360) % 360;
    saveRotation(currentPhoto, newRotation);
  };

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

  // Helper function to determine if a load is "Loading" or "Delivery"
  const getLoadType = (load: LoadItem, photoData: PhotoData | null): "Loading" | "Delivery" => {
    // Check notes for keywords that indicate loading operations
    const notes = photoData?.notes || load.note || "";
    const lowerNotes = notes.toLowerCase();
    
    // If notes mention "empty and full weight" or "license plate", it's a loading operation
    if (lowerNotes.includes("empty and full weight") || lowerNotes.includes("license plate")) {
      return "Loading";
    }
    
    // Check deliveryType
    if (load.deliveryType === "ssw_pickup" || load.deliveryType === "outbound_pickup") {
      return "Loading";
    }
    
    // Default: client_delivery means delivery TO the facility
    if (load.deliveryType === "client_delivery") {
      return "Delivery";
    }
    
    // Default to Delivery if unclear
    return "Delivery";
  };

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

  // Count delivered using actual database status
  const todayDelivered = loads.filter((l) => {
    const photoData = l.vrNumber ? photosByVr[l.vrNumber] : null;
    return photoData?.status === "delivered" || l.isDelivered;
  }).length;
  const todayPending = loads.length - todayDelivered;

  // Fetch delivery record when load is selected

  const handleSidebarClose = () => {
    setSelectedVrNumber(null);
  };

  const handleSidebarUpdate = () => {
    // Refresh the view by triggering a re-render
    // The parent component should handle the refresh
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Delivery Record Sidebar */}
      <DeliveryRecordSidebar
        vrNumber={selectedVrNumber}
        loadNumber={selectedVrNumber ? allLoads.find((l) => l.vrNumber === selectedVrNumber)?.loadNumber : undefined}
        onClose={handleSidebarClose}
        onUpdate={handleSidebarUpdate}
      />
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

          {/* Day's Truck Loads */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {dayLabel}&apos;s Truck Loads ({loads.length})
            </h3>
            {loads.map((load) => {
              // Get photo data for this load
              const photoData = load.vrNumber ? photosByVr[load.vrNumber] : null;
              const hasPhotos = photoData && photoData.photoCount > 0;
              const firstPhotoUrl = hasPhotos ? photoData.photoUrls[0] : null;

              // Check actual delivery status from database (photosByVr) - this takes priority over schedule
              const actuallyDelivered = photoData?.status === "delivered" || load.isDelivered;

              return (
                <div
                  key={load.id}
                  onClick={() => {
                    // Only open sidebar if VR number exists
                    // The sidebar requires a VR number to fetch the record
                    if (load.vrNumber) {
                      setSelectedVrNumber(load.vrNumber);
                    }
                  }}
                  className={`rounded-xl border-2 p-4 transition-all cursor-pointer active:scale-[0.99] ${
                    actuallyDelivered
                      ? "bg-emerald-50 border-emerald-300 hover:border-emerald-400"
                      : "bg-white border-gray-200 hover:border-blue-400 hover:shadow-md"
                  }`}
                >
                  {/* Main card layout with photo on LEFT */}
                  <div className="flex gap-3">
                    {/* Photo Thumbnail - Left Side (only shown if photos exist) */}
                    {hasPhotos && firstPhotoUrl && (
                      <div
                        className="flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxPhotos(photoData.photoUrls);
                          setLightboxIndex(0);
                          setShowLightbox(true);
                        }}
                      >
                        <div className="relative cursor-pointer">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm hover:border-emerald-400 transition-colors">
                            <Image
                              src={firstPhotoUrl}
                              alt="Delivery photo"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          {/* Photo count badge */}
                          {photoData.photoCount > 1 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center shadow">
                              +{photoData.photoCount - 1}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Content - Middle */}
                    <div className="flex-1 min-w-0">
                      {/* VR Number and Load Type */}
                      <div className="flex items-center gap-2 mb-1">
                        {actuallyDelivered ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        )}
                        <span className="font-mono text-base sm:text-lg font-bold text-gray-900 truncate">
                          {load.vrNumber ? `VR ${load.vrNumber}` : "VR# Pending"}
                        </span>
                        {/* Loading vs Delivery Badge */}
                        {(() => {
                          const loadType = getLoadType(load, photoData);
                          return (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                loadType === "Loading"
                                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                                  : "bg-purple-100 text-purple-700 border border-purple-200"
                              }`}
                            >
                              {loadType}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Status line */}
                      <div className="flex flex-wrap items-center gap-1.5 text-sm">
                        <span className={`font-medium ${actuallyDelivered ? "text-emerald-700" : "text-amber-600"}`}>
                          {actuallyDelivered ? (load.statusTag === "moved" ? "Delivered (rescheduled)" : "Delivered") : "Scheduled"}
                        </span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-600">20 tons</span>
                        {/* Show delivery time if available */}
                        {actuallyDelivered && photoData?.deliveredAt && (
                          <>
                            <span className="text-gray-400">·</span>
                            <span className="text-emerald-600 text-xs">
                              {new Date(photoData.deliveredAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Notes - Show delivery record notes if available, otherwise show schedule note */}
                      {(photoData?.notes || load.note) && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {photoData?.notes || load.note}
                        </p>
                      )}
                    </div>

                    {/* Right Column - Truck Load # and Badge */}
                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Truck</span>
                        <div className="text-lg font-bold text-gray-400">#{photoData?.loadNumber || load.loadNumber}</div>
                      </div>

                      {actuallyDelivered ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Done
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600">
                          Update
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day Total */}
          <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
            <span className="font-semibold text-gray-700">{dayLabel}&apos;s Total</span>
            <span className="text-lg font-bold text-gray-900">{loads.length * 20} tons</span>
          </div>
        </>
      )}


      {/* Full-screen Photo Lightbox - Mobile Optimized */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          {/* Top bar with controls */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
            {/* Photo counter */}
            {lightboxPhotos.length > 1 ? (
              <div className="px-3 py-1 rounded-full bg-black/50 text-white text-sm font-medium">
                {lightboxIndex + 1} / {lightboxPhotos.length}
              </div>
            ) : (
              <div />
            )}

            {/* Right side controls */}
            <div className="flex items-center gap-2">
              {/* Rotate button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRotateLeft();
                }}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Rotate left"
              >
                <RotateCcw className="h-6 w-6" />
              </button>

              {/* Close button */}
              <button
                onClick={() => setShowLightbox(false)}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Previous button */}
          {lightboxPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev === 0 ? lightboxPhotos.length - 1 : prev - 1));
              }}
              className="absolute left-2 sm:left-4 z-10 p-2 sm:p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          )}

          {/* Photo with rotation */}
          <div
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full h-full transition-transform duration-300"
              style={{
                transform: `rotate(${photoRotations[lightboxPhotos[lightboxIndex]] || 0}deg)`,
              }}
            >
              <Image
                src={lightboxPhotos[lightboxIndex]}
                alt={`Photo ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>
          </div>

          {/* Next button */}
          {lightboxPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev === lightboxPhotos.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-2 sm:right-4 z-10 p-2 sm:p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          )}

          {/* Swipe hint for mobile */}
          <div className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm sm:hidden">
            Tap anywhere to close
          </div>
        </div>
      )}
    </div>
  );
}
