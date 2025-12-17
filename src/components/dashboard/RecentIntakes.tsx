"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, formatWeight, INTAKE_STATUSES } from "@/lib/utils"
import { ArrowRight, Truck } from "lucide-react"

interface Intake {
  id: string
  ticketNumber: string
  clientName: string
  wasteType: string
  estimatedWeight: number
  actualWeight: number | null
  status: string
  scheduledDate: Date
}

interface RecentIntakesProps {
  intakes: Intake[]
}

export function RecentIntakes({ intakes }: RecentIntakesProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = INTAKE_STATUSES.find((s) => s.value === status)
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          statusConfig?.color || "bg-gray-100 text-gray-800"
        }`}
      >
        {statusConfig?.label || status}
      </span>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Intakes</CardTitle>
        <Link href="/intakes">
          <Button variant="ghost" size="sm" className="text-emerald-600">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {intakes.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No recent intakes</p>
            <Link href="/intake/new">
              <Button variant="outline" size="sm" className="mt-4">
                Create First Intake
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {intakes.map((intake) => (
              <Link
                key={intake.id}
                href={`/intakes/${intake.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm font-medium text-emerald-600">
                        {intake.ticketNumber}
                      </span>
                      {getStatusBadge(intake.status)}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {intake.clientName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {intake.wasteType} - {formatDate(intake.scheduledDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {intake.actualWeight
                        ? formatWeight(intake.actualWeight)
                        : formatWeight(intake.estimatedWeight)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {intake.actualWeight ? "Actual" : "Estimated"}
                    </p>
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
