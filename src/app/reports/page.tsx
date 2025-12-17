import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import {
  formatCurrency,
  calculateCO2Avoided,
} from "@/lib/utils"
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Recycle,
  Users,
  Leaf,
} from "lucide-react"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function getReportData() {
  if (!process.env.DATABASE_URL) {
    return {
      ytd: { weight: 0, revenue: 0, intakes: 0 },
      lastMonth: { weight: 0, revenue: 0, intakes: 0 },
      thisMonth: { weight: 0, revenue: 0, intakes: 0 },
      topClients: [],
      wasteByType: [],
      monthlyBreakdown: [],
    }
  }

  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // YTD Summary
  const ytdStats = await prisma.wasteIntake.aggregate({
    where: {
      status: "received",
      receivedAt: { gte: startOfYear },
    },
    _sum: {
      actualWeight: true,
      totalCharge: true,
    },
    _count: true,
  })

  // Last Month Summary
  const lastMonthStats = await prisma.wasteIntake.aggregate({
    where: {
      status: "received",
      receivedAt: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
    },
    _sum: {
      actualWeight: true,
      totalCharge: true,
    },
    _count: true,
  })

  // This Month (so far)
  const thisMonthStats = await prisma.wasteIntake.aggregate({
    where: {
      status: "received",
      receivedAt: { gte: startOfMonth },
    },
    _sum: {
      actualWeight: true,
      totalCharge: true,
    },
    _count: true,
  })

  // Top clients
  const topClients = await prisma.client.findMany({
    where: { status: "active" },
    include: {
      intakes: {
        where: {
          status: "received",
          receivedAt: { gte: startOfYear },
        },
        select: { actualWeight: true, totalCharge: true },
      },
    },
    take: 5,
  })

  const topClientStats = topClients
    .map((client) => ({
      name: client.companyName,
      totalWeight: client.intakes.reduce(
        (sum, i) => sum + (i.actualWeight || 0),
        0
      ),
      totalRevenue: client.intakes.reduce(
        (sum, i) => sum + (i.totalCharge || 0),
        0
      ),
      intakeCount: client.intakes.length,
    }))
    .sort((a, b) => b.totalWeight - a.totalWeight)

  // Waste by type
  const wasteByType = await prisma.wasteIntake.groupBy({
    by: ["wasteType"],
    where: {
      status: "received",
      receivedAt: { gte: startOfYear },
    },
    _sum: { actualWeight: true },
    _count: true,
  })

  // Monthly breakdown for the year
  const monthlyBreakdown = []
  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(now.getFullYear(), i, 1)
    const monthEnd = new Date(now.getFullYear(), i + 1, 0)

    if (monthStart > now) break

    const monthData = await prisma.wasteIntake.aggregate({
      where: {
        status: "received",
        receivedAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: {
        actualWeight: true,
        totalCharge: true,
      },
      _count: true,
    })

    monthlyBreakdown.push({
      month: monthStart.toLocaleDateString("en-US", { month: "long" }),
      weight: monthData._sum.actualWeight || 0,
      revenue: monthData._sum.totalCharge || 0,
      intakes: monthData._count || 0,
    })
  }

  return {
    ytd: {
      weight: ytdStats._sum.actualWeight || 0,
      revenue: ytdStats._sum.totalCharge || 0,
      intakes: ytdStats._count || 0,
    },
    lastMonth: {
      weight: lastMonthStats._sum.actualWeight || 0,
      revenue: lastMonthStats._sum.totalCharge || 0,
      intakes: lastMonthStats._count || 0,
    },
    thisMonth: {
      weight: thisMonthStats._sum.actualWeight || 0,
      revenue: thisMonthStats._sum.totalCharge || 0,
      intakes: thisMonthStats._count || 0,
    },
    topClients: topClientStats,
    wasteByType,
    monthlyBreakdown,
  }
}

export default async function ReportsPage() {
  const data = await getReportData()
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  return (
    <div>
      <Header
        title="Reports"
        subtitle="Waste diversion analytics and reporting"
      />
      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export YTD Report
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Monthly Summary
          </Button>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Client Reports
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* YTD Summary */}
          <Card className="bg-emerald-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-emerald-800">
                <Calendar className="h-5 w-5 mr-2" />
                Year to Date ({now.getFullYear()})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-emerald-700">Waste Diverted</span>
                <span className="text-2xl font-bold text-emerald-800">
                  {data.ytd.weight.toFixed(1)} tons
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-700">Revenue</span>
                <span className="text-2xl font-bold text-emerald-800">
                  {formatCurrency(data.ytd.revenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-700">Total Intakes</span>
                <span className="text-lg font-semibold text-emerald-800">
                  {data.ytd.intakes}
                </span>
              </div>
              <div className="border-t border-emerald-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700 flex items-center">
                    <Leaf className="h-4 w-4 mr-1" /> CO2 Avoided
                  </span>
                  <span className="font-semibold text-emerald-800">
                    {calculateCO2Avoided(data.ytd.weight).toFixed(1)} tons
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Month */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                {lastMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Waste Diverted</span>
                <span className="text-2xl font-bold">
                  {data.lastMonth.weight.toFixed(1)} tons
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenue</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(data.lastMonth.revenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Intakes</span>
                <span className="text-lg font-semibold">
                  {data.lastMonth.intakes}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* This Month (so far) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Recycle className="h-5 w-5 mr-2 text-purple-600" />
                {now.toLocaleDateString("en-US", { month: "long" })} (So Far)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Waste Diverted</span>
                <span className="text-2xl font-bold">
                  {data.thisMonth.weight.toFixed(1)} tons
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenue</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(data.thisMonth.revenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Intakes</span>
                <span className="text-lg font-semibold">
                  {data.thisMonth.intakes}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Clients */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-emerald-600" />
                Top Clients (YTD)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.topClients.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No data available</p>
              ) : (
                <div className="space-y-4">
                  {data.topClients.map((client, index) => (
                    <div
                      key={client.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full font-bold mr-3">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-gray-500">
                            {client.intakeCount} intakes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{client.totalWeight.toFixed(1)} tons</p>
                        <p className="text-sm text-emerald-600">
                          {formatCurrency(client.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Waste by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Recycle className="h-5 w-5 mr-2 text-emerald-600" />
                Waste by Type (YTD)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.wasteByType.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No data available</p>
              ) : (
                <div className="space-y-3">
                  {data.wasteByType.map((type) => {
                    const percentage = data.ytd.weight > 0
                      ? ((type._sum.actualWeight || 0) / data.ytd.weight) * 100
                      : 0
                    return (
                      <div key={type.wasteType}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">
                            {type.wasteType.replace(/_/g, " ")}
                          </span>
                          <span className="font-medium">
                            {(type._sum.actualWeight || 0).toFixed(1)} tons
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-emerald-600 h-2.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
              Monthly Breakdown ({now.getFullYear()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.monthlyBreakdown.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Month
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Intakes
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Weight (tons)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Revenue
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        CO2 Avoided
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.monthlyBreakdown.map((row) => (
                      <tr key={row.month} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap font-medium">
                          {row.month}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          {row.intakes}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-medium">
                          {row.weight.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-emerald-600 font-medium">
                          {formatCurrency(row.revenue)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-green-600">
                          {calculateCO2Avoided(row.weight).toFixed(1)} tons
                        </td>
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr className="bg-emerald-50 font-bold">
                      <td className="px-4 py-3 whitespace-nowrap">Total</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        {data.ytd.intakes}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        {data.ytd.weight.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-emerald-600">
                        {formatCurrency(data.ytd.revenue)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-green-600">
                        {calculateCO2Avoided(data.ytd.weight).toFixed(1)} tons
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
