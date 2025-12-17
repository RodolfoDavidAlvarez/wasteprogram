import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  calculateCO2Avoided,
  calculateLandfillSpaceSaved,
  calculateCompostProduced,
} from "@/lib/utils"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    // During Vercel builds or first-time deploys, env vars may not be set yet.
    // Return a safe empty payload instead of crashing the build/runtime.
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        stats: {
          ytdWasteDiverted: 0,
          ytdRevenue: 0,
          ytdIntakeCount: 0,
          monthWasteDiverted: 0,
          monthRevenue: 0,
          monthIntakeCount: 0,
          pendingIntakes: 0,
          activeClients: 0,
        },
        recentIntakes: [],
        upcomingSchedule: [],
        monthlyData: [],
        wasteTypeData: [],
        environmentalImpact: {
          totalWasteDiverted: 0,
          co2Avoided: 0,
          landfillSpaceSaved: 0,
          compostProduced: 0,
        },
      })
    }

    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get YTD stats
    const ytdIntakes = await prisma.wasteIntake.aggregate({
      where: {
        status: "received",
        receivedAt: {
          gte: startOfYear,
        },
      },
      _sum: {
        actualWeight: true,
        totalCharge: true,
      },
      _count: true,
    })

    // Get month stats
    const monthIntakes = await prisma.wasteIntake.aggregate({
      where: {
        status: "received",
        receivedAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        actualWeight: true,
        totalCharge: true,
      },
      _count: true,
    })

    // Get pending intakes count
    const pendingCount = await prisma.wasteIntake.count({
      where: {
        status: { in: ["pending", "approved", "scheduled"] },
      },
    })

    // Get active clients count
    const activeClientsCount = await prisma.client.count({
      where: { status: "active" },
    })

    // Get recent intakes
    const recentIntakes = await prisma.wasteIntake.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { companyName: true },
        },
      },
    })

    // Get upcoming schedule (next 7 days)
    const upcomingSchedule = await prisma.wasteIntake.findMany({
      where: {
        status: { in: ["approved", "scheduled"] },
        scheduledDate: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { scheduledDate: "asc" },
      take: 5,
      include: {
        client: {
          select: { companyName: true },
        },
      },
    })

    // Get monthly data for charts (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

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
      })

      monthlyData.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        tons: monthData._sum.actualWeight || 0,
        revenue: monthData._sum.totalCharge || 0,
      })
    }

    // Get waste by type
    const wasteByType = await prisma.wasteIntake.groupBy({
      by: ["wasteType"],
      where: {
        status: "received",
        receivedAt: {
          gte: startOfYear,
        },
      },
      _sum: {
        actualWeight: true,
      },
    })

    const wasteTypeData = wasteByType.map((item) => ({
      name: item.wasteType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: item._sum.actualWeight || 0,
    }))

    // Calculate environmental impact
    const totalWasteDiverted = ytdIntakes._sum.actualWeight || 0
    const co2Avoided = calculateCO2Avoided(totalWasteDiverted)
    const landfillSpaceSaved = calculateLandfillSpaceSaved(totalWasteDiverted)
    const compostProduced = calculateCompostProduced(totalWasteDiverted)

    return NextResponse.json({
      stats: {
        ytdWasteDiverted: ytdIntakes._sum.actualWeight || 0,
        ytdRevenue: ytdIntakes._sum.totalCharge || 0,
        ytdIntakeCount: ytdIntakes._count || 0,
        monthWasteDiverted: monthIntakes._sum.actualWeight || 0,
        monthRevenue: monthIntakes._sum.totalCharge || 0,
        monthIntakeCount: monthIntakes._count || 0,
        pendingIntakes: pendingCount,
        activeClients: activeClientsCount,
      },
      recentIntakes: recentIntakes.map((intake) => ({
        id: intake.id,
        ticketNumber: intake.ticketNumber,
        clientName: intake.client.companyName,
        wasteType: intake.wasteType,
        estimatedWeight: intake.estimatedWeight,
        actualWeight: intake.actualWeight,
        status: intake.status,
        scheduledDate: intake.scheduledDate,
      })),
      upcomingSchedule: upcomingSchedule.map((item) => ({
        id: item.id,
        ticketNumber: item.ticketNumber,
        clientName: item.client.companyName,
        deliveryType: item.deliveryType,
        scheduledDate: item.scheduledDate,
        scheduledTimeWindow: item.scheduledTimeWindow,
        pickupAddress: item.pickupAddress,
      })),
      monthlyData,
      wasteTypeData,
      environmentalImpact: {
        totalWasteDiverted,
        co2Avoided,
        landfillSpaceSaved,
        compostProduced,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
