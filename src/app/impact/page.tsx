import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import {
  calculateCO2Avoided,
  calculateLandfillSpaceSaved,
  calculateCompostProduced,
  calculateMethaneAvoided,
} from "@/lib/utils"
import {
  Leaf,
  Wind,
  Trees,
  Recycle,
  Car,
  Home,
  TreeDeciduous,
  Droplets,
} from "lucide-react"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function getImpactData() {
  if (!process.env.DATABASE_URL) {
    return {
      ytdWeight: 0,
      ytdIntakes: 0,
      allTimeWeight: 0,
      allTimeIntakes: 0,
      monthlyData: [],
    }
  }

  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  const ytdStats = await prisma.wasteIntake.aggregate({
    where: {
      status: "received",
      receivedAt: { gte: startOfYear },
    },
    _sum: {
      actualWeight: true,
    },
    _count: true,
  })

  // All time stats
  const allTimeStats = await prisma.wasteIntake.aggregate({
    where: { status: "received" },
    _sum: { actualWeight: true },
    _count: true,
  })

  // Monthly breakdown for visualization
  const monthlyData = []
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

    const monthStats = await prisma.wasteIntake.aggregate({
      where: {
        status: "received",
        receivedAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: { actualWeight: true },
    })

    monthlyData.push({
      month: monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      weight: monthStats._sum.actualWeight || 0,
    })
  }

  return {
    ytdWeight: ytdStats._sum.actualWeight || 0,
    ytdIntakes: ytdStats._count || 0,
    allTimeWeight: allTimeStats._sum.actualWeight || 0,
    allTimeIntakes: allTimeStats._count || 0,
    monthlyData,
  }
}

export default async function ImpactPage() {
  const data = await getImpactData()

  // Calculate environmental metrics
  const ytdCO2Avoided = calculateCO2Avoided(data.ytdWeight)
  const ytdLandfillSaved = calculateLandfillSpaceSaved(data.ytdWeight)
  const ytdCompostProduced = calculateCompostProduced(data.ytdWeight)
  const ytdMethaneAvoided = calculateMethaneAvoided(data.ytdWeight)

  const allTimeCO2Avoided = calculateCO2Avoided(data.allTimeWeight)
  const allTimeCompostProduced = calculateCompostProduced(data.allTimeWeight)

  // Equivalent calculations for context
  const carsRemoved = Math.round(ytdCO2Avoided * 0.22) // ~4.6 tons CO2 per car per year
  const homesEnergy = Math.round(ytdCO2Avoided * 0.12) // ~8.3 tons CO2 per home per year
  const treesPlanted = Math.round(ytdCO2Avoided * 16.5) // ~0.06 tons CO2 per tree per year
  const gallonsSaved = Math.round(data.ytdWeight * 100) // Approximate water savings

  return (
    <div>
      <Header
        title="Environmental Impact"
        subtitle="Measuring our contribution to sustainability"
      />
      <div className="p-6 space-y-6">
        {/* Hero Stats */}
        <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <Leaf className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-2">
              {data.ytdWeight.toFixed(1)} Tons Diverted
            </h2>
            <p className="text-emerald-100">
              Year to Date - {new Date().getFullYear()}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Wind className="h-8 w-8 mx-auto mb-2 opacity-90" />
              <p className="text-2xl font-bold">{ytdCO2Avoided.toFixed(1)}</p>
              <p className="text-sm text-emerald-100">Tons CO2 Avoided</p>
            </div>
            <div className="text-center">
              <Trees className="h-8 w-8 mx-auto mb-2 opacity-90" />
              <p className="text-2xl font-bold">{ytdLandfillSaved.toFixed(0)}</p>
              <p className="text-sm text-emerald-100">Cubic Yards Saved</p>
            </div>
            <div className="text-center">
              <Recycle className="h-8 w-8 mx-auto mb-2 opacity-90" />
              <p className="text-2xl font-bold">{ytdCompostProduced.toFixed(1)}</p>
              <p className="text-sm text-emerald-100">Tons Compost</p>
            </div>
            <div className="text-center">
              <Droplets className="h-8 w-8 mx-auto mb-2 opacity-90" />
              <p className="text-2xl font-bold">{ytdMethaneAvoided.toFixed(2)}</p>
              <p className="text-sm text-emerald-100">Tons Methane Avoided</p>
            </div>
          </div>
        </div>

        {/* Real-World Equivalents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What This Means</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Car className="h-10 w-10 mx-auto text-blue-600 mb-2" />
                <p className="text-3xl font-bold text-blue-700">{carsRemoved}</p>
                <p className="text-sm text-blue-600">Cars off the road for a year</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <Home className="h-10 w-10 mx-auto text-amber-600 mb-2" />
                <p className="text-3xl font-bold text-amber-700">{homesEnergy}</p>
                <p className="text-sm text-amber-600">Homes energy use for a year</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TreeDeciduous className="h-10 w-10 mx-auto text-green-600 mb-2" />
                <p className="text-3xl font-bold text-green-700">{treesPlanted}</p>
                <p className="text-sm text-green-600">Trees planted equivalent</p>
              </div>
              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <Droplets className="h-10 w-10 mx-auto text-cyan-600 mb-2" />
                <p className="text-3xl font-bold text-cyan-700">{gallonsSaved.toLocaleString()}</p>
                <p className="text-sm text-cyan-600">Gallons water saved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Time Impact */}
        <Card className="bg-gradient-to-r from-gray-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-lg">All-Time Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {data.allTimeWeight.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">Total Tons Diverted</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-3xl font-bold text-emerald-600">
                  {allTimeCO2Avoided.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">Tons CO2 Avoided</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-3xl font-bold text-green-600">
                  {allTimeCompostProduced.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">Tons Compost Created</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {data.allTimeIntakes}
                </p>
                <p className="text-sm text-gray-500">Total Waste Intakes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Diversion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {data.monthlyData.map((month) => {
                const maxWeight = Math.max(...data.monthlyData.map((m) => m.weight), 1)
                const heightPercent = (month.weight / maxWeight) * 100

                return (
                  <div
                    key={month.month}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="w-full flex flex-col items-center justify-end h-48">
                      <div
                        className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                        style={{ height: `${heightPercent}%`, minHeight: month.weight > 0 ? "4px" : "0" }}
                        title={`${month.weight.toFixed(1)} tons`}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      {month.month}
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      {month.weight.toFixed(1)}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Impact Methodology */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How We Calculate Impact</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-gray-600">
            <p>
              Our environmental impact metrics are calculated using EPA WARM model
              approximations and industry standards:
            </p>
            <ul className="space-y-2 mt-4">
              <li>
                <strong>CO2 Avoided:</strong> ~0.9 metric tons CO2e per ton of organic
                waste diverted from landfill to composting
              </li>
              <li>
                <strong>Landfill Space:</strong> ~1.5 cubic yards per ton of waste
              </li>
              <li>
                <strong>Compost Produced:</strong> ~50% conversion rate from waste to
                finished compost
              </li>
              <li>
                <strong>Methane Avoided:</strong> ~0.06 metric tons per ton of organic
                waste (methane that would have been generated in landfill)
              </li>
            </ul>
            <p className="mt-4">
              These calculations help demonstrate the real environmental benefit of
              diverting organic waste from landfills and converting it into valuable
              compost for soil restoration.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
