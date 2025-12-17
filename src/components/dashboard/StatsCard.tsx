"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Truck, DollarSign, Users, Clock } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  iconName: "truck" | "dollar" | "users" | "clock"
  trend?: {
    value: number
    label: string
  }
  iconColor?: string
  iconBgColor?: string
}

const iconMap = {
  truck: Truck,
  dollar: DollarSign,
  users: Users,
  clock: Clock,
}

export function StatsCard({
  title,
  value,
  subtitle,
  iconName,
  trend,
  iconColor = "text-emerald-600",
  iconBgColor = "bg-emerald-100",
}: StatsCardProps) {
  const Icon = iconMap[iconName]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                {trend.value >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend.value >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.value >= 0 ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-full", iconBgColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
