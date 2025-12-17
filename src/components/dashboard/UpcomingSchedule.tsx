"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Truck, MapPin } from "lucide-react"

interface ScheduleItem {
  id: string
  ticketNumber: string
  clientName: string
  deliveryType: string
  scheduledDate: Date
  scheduledTimeWindow: string | null
  pickupAddress: string | null
}

interface UpcomingScheduleProps {
  items: ScheduleItem[]
}

export function UpcomingSchedule({ items }: UpcomingScheduleProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Upcoming Schedule</CardTitle>
        <Link href="/schedule">
          <Button variant="ghost" size="sm" className="text-emerald-600">
            View calendar <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No upcoming pickups or deliveries</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/intakes/${item.id}`}
                className="block"
              >
                <div className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 w-12 text-center">
                    <div className="text-xs text-gray-500 uppercase">
                      {new Date(item.scheduledDate).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </div>
                    <div className="text-lg font-bold text-emerald-600">
                      {new Date(item.scheduledDate).getDate()}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {item.clientName}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-emerald-100 text-emerald-800">
                        {item.deliveryType === "client_delivery"
                          ? "Delivery"
                          : "Pickup"}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Truck className="h-3 w-3 mr-1" />
                      {item.ticketNumber}
                      {item.scheduledTimeWindow && (
                        <span className="ml-2">| {item.scheduledTimeWindow}</span>
                      )}
                    </div>
                    {item.pickupAddress && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.pickupAddress}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
