"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Wind, Trees, Recycle } from "lucide-react"

interface EnvironmentalImpactProps {
  totalWasteDiverted: number
  co2Avoided: number
  landfillSpaceSaved: number
  compostProduced: number
}

export function EnvironmentalImpact({
  totalWasteDiverted,
  co2Avoided,
  landfillSpaceSaved,
  compostProduced,
}: EnvironmentalImpactProps) {
  const metrics = [
    {
      label: "Waste Diverted",
      value: `${totalWasteDiverted.toFixed(1)} tons`,
      icon: Recycle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      description: "From landfill",
    },
    {
      label: "CO2 Avoided",
      value: `${co2Avoided.toFixed(1)} tons`,
      icon: Wind,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Emissions prevented",
    },
    {
      label: "Landfill Space",
      value: `${landfillSpaceSaved.toFixed(0)} yd³`,
      icon: Trees,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Space saved",
    },
    {
      label: "Compost Produced",
      value: `${compostProduced.toFixed(1)} tons`,
      icon: Leaf,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      description: "Quality compost",
    },
  ]

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-green-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Leaf className="h-5 w-5 mr-2 text-emerald-600" />
          Environmental Impact (Year to Date)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-white rounded-lg p-4 shadow-sm"
            >
              <div className={`inline-flex p-2 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {metric.value}
              </p>
              <p className="text-sm font-medium text-gray-700">{metric.label}</p>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-white rounded-lg text-center">
          <p className="text-sm text-gray-600">
            Equivalent to removing{" "}
            <span className="font-bold text-emerald-600">
              {Math.round(co2Avoided * 0.22)}
            </span>{" "}
            cars from the road for a year
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
