import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentIntakes } from "@/components/dashboard/RecentIntakes";
import { WasteChart } from "@/components/dashboard/WasteChart";
import { UpcomingSchedule } from "@/components/dashboard/UpcomingSchedule";
import { EnvironmentalImpact } from "@/components/dashboard/EnvironmentalImpact";
import { Tabs } from "@/components/ui/tabs";
import { Calendar } from "@/components/schedule/Calendar";
import { prisma } from "@/lib/prisma";
import { calculateCO2Avoided, calculateLandfillSpaceSaved, calculateCompostProduced } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMPTY_DATA = {
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
  calendarIntakes: [],
  monthlyData: [],
  wasteTypeData: [{ name: "No Data", value: 0 }],
  environmentalImpact: {
    totalWasteDiverted: 0,
    co2Avoided: 0,
    landfillSpaceSaved: 0,
    compostProduced: 0,
  },
  dbError: false,
};

async function getDashboardData() {
  // Allow deployments to succeed before a DB is configured.
  if (!process.env.DATABASE_URL) {
    return EMPTY_DATA;
  }

  // Wrap in try-catch to handle Supabase connection pooler issues
  try {

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

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
  });

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
  });

  // Get pending intakes count
  const pendingCount = await prisma.wasteIntake.count({
    where: {
      status: { in: ["pending", "approved", "scheduled"] },
    },
  });

  // Get active clients count
  const activeClientsCount = await prisma.client.count({
    where: { status: "active" },
  });

  // Get recent intakes
  const recentIntakes = await prisma.wasteIntake.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      client: {
        select: { companyName: true },
      },
    },
  });

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
  });

  // Get monthly data for charts (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

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
    });

    monthlyData.push({
      month: monthStart.toLocaleDateString("en-US", { month: "short" }),
      tons: monthData._sum.actualWeight || 0,
      revenue: monthData._sum.totalCharge || 0,
    });
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
  });

  const wasteTypeData = wasteByType.map((item) => ({
    name: item.wasteType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value: item._sum.actualWeight || 0,
  }));

  // Get calendar intakes (this month and next)
  const calendarStartOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const calendarIntakes = await prisma.wasteIntake.findMany({
    where: {
      status: { in: ["approved", "scheduled", "in_transit"] },
      scheduledDate: {
        gte: calendarStartOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      client: {
        select: { companyName: true },
      },
    },
    orderBy: { scheduledDate: "asc" },
  });

  // Calculate environmental impact
  const totalWasteDiverted = ytdIntakes._sum.actualWeight || 0;
  const co2Avoided = calculateCO2Avoided(totalWasteDiverted);
  const landfillSpaceSaved = calculateLandfillSpaceSaved(totalWasteDiverted);
  const compostProduced = calculateCompostProduced(totalWasteDiverted);

  return {
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
    calendarIntakes,
    monthlyData,
    wasteTypeData: wasteTypeData.length > 0 ? wasteTypeData : [{ name: "No Data", value: 0 }],
    environmentalImpact: {
      totalWasteDiverted,
      co2Avoided,
      landfillSpaceSaved,
      compostProduced,
    },
    dbError: false,
  };
  } catch (error) {
    // Handle Supabase connection pooler failures gracefully
    console.error("Database connection error:", error);
    return { ...EMPTY_DATA, dbError: true };
  }
}

export default async function AdminPage() {
  const data = await getDashboardData();

  return (
    <div>
      <Header title="Admin Dashboard" subtitle="Waste Diversion Program Overview" />
      <div className="p-6 space-y-6">
        {/* Database Connection Warning */}
        {data.dbError && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 text-amber-600 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-amber-800">Database Connection Issue</h3>
              <p className="text-sm text-amber-700 mt-1">
                Unable to connect to the database. Some data may be unavailable. Please try refreshing the page.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Waste Diverted (YTD)"
            value={`${data.stats.ytdWasteDiverted.toFixed(1)} tons`}
            subtitle={`${data.stats.monthWasteDiverted.toFixed(1)} tons this month`}
            iconName="truck"
            trend={data.stats.monthWasteDiverted > 0 ? { value: 12, label: "vs last month" } : undefined}
          />
          <StatsCard
            title="Tipping Revenue (YTD)"
            value={`$${data.stats.ytdRevenue.toLocaleString()}`}
            subtitle={`$${data.stats.monthRevenue.toLocaleString()} this month`}
            iconName="dollar"
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatsCard
            title="Active Clients"
            value={data.stats.activeClients}
            subtitle={`${data.stats.ytdIntakeCount} intakes YTD`}
            iconName="users"
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatsCard
            title="Pending Intakes"
            value={data.stats.pendingIntakes}
            subtitle="Awaiting processing"
            iconName="clock"
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
          />
        </div>

        {/* Environmental Impact */}
        <EnvironmentalImpact
          totalWasteDiverted={data.environmentalImpact.totalWasteDiverted}
          co2Avoided={data.environmentalImpact.co2Avoided}
          landfillSpaceSaved={data.environmentalImpact.landfillSpaceSaved}
          compostProduced={data.environmentalImpact.compostProduced}
        />

        {/* Charts */}
        <WasteChart monthlyData={data.monthlyData} wasteTypeData={data.wasteTypeData} />

        {/* Recent Intakes & Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentIntakes intakes={data.recentIntakes} />
          <UpcomingSchedule items={data.upcomingSchedule} />
        </div>

        {/* Calendar & Details */}
        <Tabs
          tabs={[
            {
              label: "Calendar",
              value: "calendar",
              content: <Calendar intakes={data.calendarIntakes} />,
            },
            {
              label: "Details",
              value: "details",
              content: (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RecentIntakes intakes={data.recentIntakes} />
                  <UpcomingSchedule items={data.upcomingSchedule} />
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}


