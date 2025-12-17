"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Truck, Package, Weight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

interface CalendarProps {
  intakes?: Array<{
    id: string
    ticketNumber: string
    scheduledDate: Date | string
    scheduledTimeWindow?: string | null
    estimatedWeight: number
    client: { companyName: string }
  }>
}

export function Calendar({ intakes = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const today = new Date()

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // First day of month and how many days in month
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }, [currentDate])

  // Get intakes for each day
  const intakesByDay = useMemo(() => {
    const map: Record<number, typeof intakes> = {}

    intakes.forEach((intake) => {
      const date = new Date(intake.scheduledDate)
      if (
        date.getFullYear() === currentDate.getFullYear() &&
        date.getMonth() === currentDate.getMonth()
      ) {
        const day = date.getDate()
        if (!map[day]) map[day] = []
        map[day].push(intake)
      }
    })

    return map
  }, [intakes, currentDate])

  const isToday = (day: number | null) => {
    if (day === null) return false
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isPast = (day: number | null) => {
    if (day === null) return false
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const todayCheck = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return checkDate < todayCheck
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{monthYear}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={
                currentDate.getMonth() === today.getMonth() &&
                currentDate.getFullYear() === today.getFullYear()
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={handleToday}
              className="text-xs"
            >
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const hasIntakes = day !== null && intakesByDay[day]?.length > 0
            const isTodayDate = isToday(day)
            const isPastDate = isPast(day)

            return (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 rounded-lg border text-sm
                  ${
                    day === null
                      ? "bg-gray-50 border-gray-100"
                      : isTodayDate
                        ? "bg-emerald-100 border-emerald-300 font-bold"
                        : isPastDate
                          ? "bg-gray-50 border-gray-200 text-gray-400"
                          : "bg-white border-gray-200 hover:border-emerald-300"
                  }
                `}
              >
                {day && (
                  <>
                    <div
                      className={`
                        text-lg font-semibold mb-1
                        ${isTodayDate ? "text-emerald-700" : "text-gray-800"}
                      `}
                    >
                      {day}
                    </div>

                    {/* Intakes for this day */}
                    <div className="space-y-1">
                      {intakesByDay[day]?.slice(0, 2).map((intake) => (
                        <Link key={intake.id} href={`/intakes/${intake.id}`}>
                          <div className="text-xs bg-emerald-50 text-emerald-700 p-1.5 rounded hover:bg-emerald-100 cursor-pointer transition-colors">
                            <div className="font-mono text-[10px] font-semibold truncate">
                              {intake.ticketNumber}
                            </div>
                            <div className="truncate opacity-80 text-[10px]">
                              {(intake.estimatedWeight).toFixed(1)} tons
                            </div>
                          </div>
                        </Link>
                      ))}
                      {intakesByDay[day]?.length > 2 && (
                        <button
                          onClick={() => setSelectedDay(day)}
                          className="w-full text-xs text-emerald-600 font-semibold px-1 hover:underline cursor-pointer"
                        >
                          +{intakesByDay[day].length - 2} more
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t text-xs text-gray-600 flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-50 border border-emerald-300 rounded"></div>
            <span>Has intakes</span>
          </div>
        </div>
      </CardContent>

      {/* Day Detail Dialog */}
      <Dialog open={selectedDay !== null} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2 text-emerald-600" />
              {selectedDay && (
                <>
                  {currentDate.toLocaleDateString("en-US", { month: "long" })} {selectedDay},{" "}
                  {currentDate.getFullYear()}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {selectedDay && intakesByDay[selectedDay]?.map((intake) => {
              const totalWeight = intakesByDay[selectedDay].reduce((sum, i) => sum + i.estimatedWeight, 0)
              return (
                <Link key={intake.id} href={`/intakes/${intake.id}`}>
                  <div className="border rounded-lg p-4 hover:bg-emerald-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-semibold text-emerald-600">
                            {intake.ticketNumber}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">{intake.client.companyName}</p>
                        {intake.scheduledTimeWindow && (
                          <p className="text-sm text-gray-500 mt-1">
                            {intake.scheduledTimeWindow}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-gray-700">
                          <Weight className="h-4 w-4 mr-1" />
                          <span className="font-semibold">{intake.estimatedWeight.toFixed(1)} tons</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
            {selectedDay && intakesByDay[selectedDay] && (
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg">
                  <span className="font-semibold text-emerald-900">Total for Day:</span>
                  <div className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-emerald-600" />
                    <span className="text-lg font-bold text-emerald-600">
                      {intakesByDay[selectedDay].reduce((sum, i) => sum + i.estimatedWeight, 0).toFixed(1)} tons
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
