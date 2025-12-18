"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronRightIcon, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CalendarProps {
  intakes?: Array<{
    id: string;
    ticketNumber: string;
    vrNumber?: string | null;
    statusTag?: "scheduled" | "delayed" | "moved" | "arrived" | null;
    note?: string | null;
    eta?: string | null;
    scheduledDate: Date | string;
    scheduledTimeWindow?: string | null;
    estimatedWeight: number;
    client: { companyName: string };
  }>;
}

type IntakeItem = NonNullable<CalendarProps["intakes"]>[number];

function getStatusPill(statusTag?: IntakeItem["statusTag"]) {
  switch (statusTag) {
    case "delayed":
      return { label: "DELAYED", className: "bg-amber-100 text-amber-900" };
    case "moved":
      return { label: "MOVED", className: "bg-red-100 text-red-900" };
    case "arrived":
      return { label: "ARRIVED", className: "bg-emerald-100 text-emerald-900" };
    default:
      return null;
  }
}

export function Calendar({ intakes = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const today = new Date();

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of month and how many days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentDate]);

  // Get intakes for each day
  const intakesByDay = useMemo(() => {
    const map: Record<number, typeof intakes> = {};

    intakes.forEach((intake) => {
      const date = new Date(intake.scheduledDate);
      if (date.getFullYear() === currentDate.getFullYear() && date.getMonth() === currentDate.getMonth()) {
        const day = date.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(intake);
      }
    });

    return map;
  }, [intakes, currentDate]);

  // Check if all loads for a day are delivered
  const getDayDeliveryStatus = (day: number): "all_delivered" | "all_scheduled" | "mixed" | "none" => {
    const dayIntakes = intakesByDay[day];
    if (!dayIntakes || dayIntakes.length === 0) return "none";

    const delivered = dayIntakes.filter(i => i.statusTag === "arrived" || i.statusTag === "moved").length;
    if (delivered === dayIntakes.length) return "all_delivered";
    if (delivered === 0) return "all_scheduled";
    return "mixed";
  };

  const isToday = (day: number | null) => {
    if (day === null) return false;
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  const isPast = (day: number | null) => {
    if (day === null) return false;
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const todayCheck = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return checkDate < todayCheck;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysOfWeekShort = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <Card className="border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="px-2 sm:px-6 pb-2 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-xl">{monthYear}</CardTitle>
          <div className="flex gap-1 sm:gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear() ? "default" : "outline"}
              size="sm"
              onClick={handleToday}
              className="text-xs h-8 px-2"
            >
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-1 sm:px-6">
        {/* Day headers - abbreviated on mobile */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
          {daysOfWeek.map((day, i) => (
            <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-600 py-1 sm:py-2">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{daysOfWeekShort[i]}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {calendarDays.map((day, index) => {
            const isTodayDate = isToday(day);
            const isPastDate = isPast(day);
            const hasIntakes = day !== null && intakesByDay[day]?.length > 0;
            const intakeCount = day !== null ? intakesByDay[day]?.length || 0 : 0;
            const deliveryStatus = day !== null ? getDayDeliveryStatus(day) : "none";

            // Determine background color based on delivery status
            const getDayStyles = () => {
              if (day === null) return "bg-gray-50 border-gray-100";
              if (isTodayDate) {
                // Today gets special styling regardless of delivery status
                if (deliveryStatus === "all_delivered") {
                  return "bg-emerald-200 border-emerald-500 ring-2 ring-blue-400 font-bold";
                }
                return "bg-blue-100 border-blue-400 ring-2 ring-blue-400 font-bold";
              }
              if (!hasIntakes) return "bg-white border-gray-200 hover:border-gray-300";

              // Days with deliveries - color by status
              switch (deliveryStatus) {
                case "all_delivered":
                  return "bg-emerald-100 border-emerald-500 hover:border-emerald-600";
                case "all_scheduled":
                  return "bg-orange-100 border-orange-400 hover:border-orange-500";
                case "mixed":
                  return "bg-gradient-to-br from-emerald-100 to-orange-100 border-orange-400 hover:border-orange-500";
                default:
                  return "bg-white border-gray-200";
              }
            };

            // Badge color based on status
            const getBadgeColor = () => {
              switch (deliveryStatus) {
                case "all_delivered": return "bg-emerald-600";
                case "all_scheduled": return "bg-orange-500";
                case "mixed": return "bg-blue-500";
                default: return "bg-gray-400";
              }
            };

            return (
              <div
                key={index}
                onClick={() => day !== null && hasIntakes && setSelectedDay(day)}
                className={`
                  min-h-[48px] sm:min-h-[100px] p-1 sm:p-2 rounded sm:rounded-lg border text-sm
                  ${hasIntakes ? "cursor-pointer" : ""}
                  ${getDayStyles()}
                `}
              >
                {day && (
                  <>
                    {/* Day number - smaller on mobile */}
                    <div
                      className={`
                        text-sm sm:text-lg font-semibold
                        ${isTodayDate ? "text-blue-700" : isPastDate ? "text-gray-400" : "text-gray-800"}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span>{day}</span>
                        {/* Mobile: show count badge */}
                        {hasIntakes && (
                          <span className={`sm:hidden inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold rounded-full text-white ${getBadgeColor()}`}>
                            {intakeCount}
                          </span>
                        )}
                        {/* Desktop: show dot */}
                        {hasIntakes && <span className={`hidden sm:inline-block h-2 w-2 rounded-full ${getBadgeColor()}`} aria-label="Has intakes" />}
                      </div>
                    </div>

                    {/* Intakes for this day - hidden on mobile, show on desktop */}
                    <div className="hidden sm:block space-y-1 mt-1">
                      {intakesByDay[day]?.slice(0, 2).map((intake) => (
                        <div
                          key={intake.id}
                          className="text-xs bg-emerald-50 text-emerald-700 p-1.5 rounded hover:bg-emerald-100 cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDay(day);
                          }}
                        >
                          {intake.vrNumber && <div className="truncate text-[10px] font-semibold">VR {intake.vrNumber}</div>}
                          {(() => {
                            const pill = getStatusPill(intake.statusTag ?? null);
                            return pill ? (
                              <div className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold ${pill.className}`}>{pill.label}</div>
                            ) : null;
                          })()}
                        </div>
                      ))}
                      {intakesByDay[day]?.length > 2 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDay(day);
                          }}
                          className="w-full text-xs text-emerald-600 font-semibold px-1 hover:underline cursor-pointer"
                        >
                          +{intakesByDay[day].length - 2} more
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t text-xs text-gray-600">
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 border-2 border-blue-400 rounded ring-1 ring-blue-400"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-100 border-2 border-emerald-500 rounded"></div>
              <span>Delivered</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-100 border-2 border-orange-400 rounded"></div>
              <span>Scheduled</span>
            </div>
          </div>
          <p className="sm:hidden text-gray-400 mt-2">Tap a day to see delivery details</p>
        </div>
      </CardContent>

      {/* Day Detail Dialog */}
      <Dialog
        open={selectedDay !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDay(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto mx-2 sm:mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center text-base sm:text-lg">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-emerald-600" />
              {selectedDay && (
                <>
                  {currentDate.toLocaleDateString("en-US", { month: "long" })} {selectedDay}, {currentDate.getFullYear()}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 sm:space-y-3 mt-2 sm:mt-4">
            {selectedDay &&
              intakesByDay[selectedDay]?.map((intake) => {
                const pill = getStatusPill(intake.statusTag ?? null);
                const hasVrNumber = !!intake.vrNumber;

                const cardContent = (
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {intake.vrNumber && (
                          <span className="text-xs font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded font-mono">
                            VR {intake.vrNumber}
                          </span>
                        )}
                        {pill && <span className={`text-xs font-semibold px-2 py-0.5 rounded ${pill.className}`}>{pill.label}</span>}
                      </div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{intake.client.companyName}</p>
                      {(intake.eta || intake.note) && (
                        <p className="text-xs text-gray-600 mt-1">
                          {intake.eta ? `ETA ${intake.eta}` : ""}
                          {intake.eta && intake.note ? " · " : ""}
                          {intake.note ?? ""}
                        </p>
                      )}
                      {intake.scheduledTimeWindow && <p className="text-xs sm:text-sm text-gray-500 mt-1">{intake.scheduledTimeWindow}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm font-medium text-gray-700">20 tons</div>
                      {hasVrNumber && (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                          View Details
                          <ChevronRightIcon className="h-3 w-3 ml-0.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );

                return hasVrNumber ? (
                  <Link
                    key={intake.id}
                    href={`/schedule/records/${encodeURIComponent(intake.vrNumber!)}`}
                    className="block border rounded-lg p-3 sm:p-4 bg-white hover:border-emerald-400 hover:shadow-sm transition-all group"
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div key={intake.id} className="border rounded-lg p-3 sm:p-4 bg-white">
                    {cardContent}
                  </div>
                );
              })}
            {selectedDay && intakesByDay[selectedDay] && (
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg">
                  <span className="font-semibold text-emerald-900 text-sm sm:text-base">Day Total:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-emerald-900">{intakesByDay[selectedDay].length} loads</span>
                    <span className="text-sm font-bold text-emerald-700">{intakesByDay[selectedDay].length * 20} tons</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
