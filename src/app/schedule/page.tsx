import { Tabs } from "@/components/ui/tabs";
import { Calendar } from "@/components/schedule/Calendar";
import { OverviewTable } from "@/components/schedule/OverviewTable";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CalendarIntake = {
  id: string;
  ticketNumber: string;
  vrNumber?: string | null;
  statusTag?: "scheduled" | "delayed" | "moved" | "arrived" | null;
  note?: string | null;
  eta?: string | null;
  scheduledDate: Date | string;
  scheduledTimeWindow?: string | null;
  estimatedWeight: number;
  client: { companyName: string; accountNumber: string };
  // Only needed for Today/Upcoming cards; calendar itself doesn't depend on these.
  status?: string;
  deliveryType?: string;
  pickupAddress?: string | null;
  wasteType?: string;
};

function asLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
  return asLocalDay(a).getTime() === asLocalDay(b).getTime();
}

function inRange(date: Date, start: Date, end: Date) {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function getManualSchedule(): {
  weekIntakes: CalendarIntake[];
  upcomingIntakes: CalendarIntake[];
  todayIntakes: CalendarIntake[];
  calendarIntakes: CalendarIntake[];
  startOfWeek: Date;
} {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // TODO: Replace this with DB-backed schedule once production DATABASE_URL is configured.
  // For now, keep this list updated manually (VR numbers + tons).
  // Last updated: 2025-12-17 by Claude Code (extracted from Casey Tucker emails)
  const y = 2025;
  const m = 11; // December (0-indexed)
  const date = (day: number) => new Date(y, m, day);

  // =============================================================================
  // VANGUARD / NESTLE PURINA DOG FOOD LOADS - FLAGSTAFF ORIGIN
  // Total: 23 loads (9 original + 2 extension + 12 additional)
  // Source: Casey Tucker <ctucker@vanguardrenewables.com>
  // Material: Off-spec dog/cat food (Salmonella-contaminated), bags on slip sheets
  // =============================================================================
  const calendarIntakes: CalendarIntake[] = [
    // Thursday 12/11 - 2 loads (DELIVERED)
    {
      id: "vr-121125-109",
      ticketNumber: "VR121125-109",
      vrNumber: "121125-109",
      scheduledDate: date(11),
      scheduledTimeWindow: "11:00-14:00",
      eta: "12:00",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "arrived",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },
    {
      id: "vr-121125-110",
      ticketNumber: "VR121125-110",
      vrNumber: "121125-110",
      scheduledDate: date(11),
      scheduledTimeWindow: "11:00-14:00",
      eta: "13:00",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "arrived",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },

    // Friday 12/12 - 2 loads (DELIVERED)
    {
      id: "vr-121225-98",
      ticketNumber: "VR121225-98",
      vrNumber: "121225-98",
      scheduledDate: date(12),
      scheduledTimeWindow: "11:00-14:30",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "arrived",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },
    {
      id: "vr-121225-99",
      ticketNumber: "VR121225-99",
      vrNumber: "121225-99",
      scheduledDate: date(12),
      scheduledTimeWindow: "11:00-14:30",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "arrived",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },

    // Monday 12/15 - 1 load delivered, 1 delayed (DELIVERED + MOVED)
    {
      id: "vr-121525-49",
      ticketNumber: "VR121525-49",
      vrNumber: "121525-49",
      scheduledDate: date(15),
      scheduledTimeWindow: "06:00-14:30",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "arrived",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },

    // Tuesday 12/16 - 2 loads (DELIVERED)
    {
      id: "vr-121025-117",
      ticketNumber: "VR121025-117",
      vrNumber: "121025-117",
      scheduledDate: date(16),
      scheduledTimeWindow: "06:00-14:30",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "arrived",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },
    {
      id: "vr-121625-45",
      ticketNumber: "VR121625-45",
      vrNumber: "121625-45",
      scheduledDate: date(16),
      scheduledTimeWindow: "06:00-14:30",
      eta: "14:20",
      note: "Arrived ~14:55",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "arrived",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },

    // Wednesday 12/17 - 3 loads (1 original + 1 additional + 1 moved from 12/15)
    {
      id: "vr-121725-41",
      ticketNumber: "VR121725-41",
      vrNumber: "121725-41",
      scheduledDate: date(17),
      scheduledTimeWindow: "06:00-14:30",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "arrived",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },
    {
      id: "vr-121725-72",
      ticketNumber: "VR121725-72",
      vrNumber: "121725-72",
      scheduledDate: date(17),
      scheduledTimeWindow: "06:00-14:30",
      note: "Additional load (making 11 total)",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "arrived",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },
    // VR121525-50 - Delayed from 12/15, delivered 12/17 ~15:00
    {
      id: "vr-121525-50",
      ticketNumber: "VR121525-50",
      vrNumber: "121525-50",
      scheduledDate: date(17),
      scheduledTimeWindow: "06:00-14:30",
      eta: "15:00",
      note: "Delayed from 12/15 → delivered 12/17",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "moved",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },

    // Thursday 12/18 - 1 Nestle load (additional)
    {
      id: "vr-121825-74",
      ticketNumber: "VR121825-74",
      vrNumber: "121825-74",
      scheduledDate: date(18),
      scheduledTimeWindow: "06:00-14:30",
      note: "Additional load (making 11 total)",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "scheduled",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },

    // =============================================================================
    // BATCH 3: 12 ADDITIONAL DOG FOOD LOADS (VR numbers pending from Casey)
    // Confirmed schedule per email 12/17/2025
    // Casey will send VR numbers once shipper confirms
    // =============================================================================
    // Thursday 12/18 - 1 additional load (VR TBD)
    {
      id: "pending-1218-1",
      ticketNumber: "PENDING-1218-1",
      vrNumber: null,
      scheduledDate: date(18),
      scheduledTimeWindow: "06:00-14:30",
      note: "Additional dog food load #1 of 12 - VR# pending",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "scheduled",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },

    // Friday 12/19 - 2 loads (VR TBD)
    {
      id: "pending-1219-1",
      ticketNumber: "PENDING-1219-1",
      vrNumber: null,
      scheduledDate: date(19),
      scheduledTimeWindow: "06:00-14:30",
      note: "Additional dog food load #2 of 12 - VR# pending",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "scheduled",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },
    {
      id: "pending-1219-2",
      ticketNumber: "PENDING-1219-2",
      vrNumber: null,
      scheduledDate: date(19),
      scheduledTimeWindow: "06:00-14:30",
      note: "Additional dog food load #3 of 12 - VR# pending",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "scheduled",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },

    // Monday 12/22 - 3 loads (VR TBD)
    {
      id: "pending-1222-1",
      ticketNumber: "PENDING-1222-1",
      vrNumber: null,
      scheduledDate: date(22),
      scheduledTimeWindow: "06:00-14:30",
      note: "Additional dog food load #4 of 12 - VR# pending",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "scheduled",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },
    {
      id: "pending-1222-2",
      ticketNumber: "PENDING-1222-2",
      vrNumber: null,
      scheduledDate: date(22),
      scheduledTimeWindow: "06:00-14:30",
      note: "Additional dog food load #5 of 12 - VR# pending",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "scheduled",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },
    {
      id: "pending-1222-3",
      ticketNumber: "PENDING-1222-3",
      vrNumber: null,
      scheduledDate: date(22),
      scheduledTimeWindow: "06:00-14:30",
      note: "Additional dog food load #6 of 12 - VR# pending",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "scheduled",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },

    // Tuesday 12/23 - 2 loads (VR TBD)
    {
      id: "pending-1223-1",
      ticketNumber: "PENDING-1223-1",
      vrNumber: null,
      scheduledDate: date(23),
      scheduledTimeWindow: "06:00-14:30",
      note: "Additional dog food load #7 of 12 - VR# pending",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "scheduled",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },
    {
      id: "pending-1223-2",
      ticketNumber: "PENDING-1223-2",
      vrNumber: null,
      scheduledDate: date(23),
      scheduledTimeWindow: "06:00-14:30",
      note: "Additional dog food load #8 of 12 - VR# pending",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "scheduled",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },

    // Wednesday 12/24 (Christmas Eve) - 1 load (VR TBD)
    {
      id: "pending-1224-1",
      ticketNumber: "PENDING-1224-1",
      vrNumber: null,
      scheduledDate: date(24),
      scheduledTimeWindow: "06:00-14:30",
      note: "Additional dog food load #9 of 12 - VR# pending (Christmas Eve)",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "scheduled",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },

    // Monday 12/29 - 3 loads (VR TBD)
    {
      id: "pending-1229-1",
      ticketNumber: "PENDING-1229-1",
      vrNumber: null,
      scheduledDate: date(29),
      scheduledTimeWindow: "06:00-14:30",
      note: "Additional dog food load #10 of 12 - VR# pending",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "scheduled",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },
    {
      id: "pending-1229-2",
      ticketNumber: "PENDING-1229-2",
      vrNumber: null,
      scheduledDate: date(29),
      scheduledTimeWindow: "06:00-14:30",
      note: "Additional dog food load #11 of 12 - VR# pending",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "scheduled",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },
    {
      id: "pending-1229-3",
      ticketNumber: "PENDING-1229-3",
      vrNumber: null,
      scheduledDate: date(29),
      scheduledTimeWindow: "06:00-14:30",
      note: "Additional dog food load #12 of 12 - VR# pending",
      estimatedWeight: 0,
      client: { companyName: "Vanguard (Purina/Flagstaff)", accountNumber: "" },
      statusTag: "scheduled",
      status: "scheduled",
      deliveryType: "client_delivery",
      wasteType: "off-spec pet food",
    },
  ];

  const todayIntakes = calendarIntakes.filter((i) => isSameDay(new Date(i.scheduledDate), now));
  const upcomingIntakes = calendarIntakes
    .filter((i) => new Date(i.scheduledDate) > now)
    .sort((a, b) => +new Date(a.scheduledDate) - +new Date(b.scheduledDate));
  const weekIntakes = calendarIntakes
    .filter((i) => inRange(new Date(i.scheduledDate), startOfWeek, endOfWeek))
    .sort((a, b) => +new Date(a.scheduledDate) - +new Date(b.scheduledDate));

  return {
    weekIntakes,
    upcomingIntakes,
    todayIntakes,
    calendarIntakes,
    startOfWeek,
  };
}

async function getScheduleData() {
  // ALWAYS use manual schedule for Vanguard/Purina project tracking
  // TODO: Switch to DB once production DATABASE_URL is configured
  return getManualSchedule();

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Get this week's scheduled intakes
  const weekIntakesRaw = await prisma.wasteIntake.findMany({
    where: {
      status: { in: ["approved", "scheduled", "in_transit"] },
      scheduledDate: {
        gte: startOfWeek,
        lte: endOfWeek,
      },
    },
    include: {
      client: {
        select: { companyName: true, accountNumber: true },
      },
    },
    orderBy: { scheduledDate: "asc" },
  });
  const weekIntakes: CalendarIntake[] = weekIntakesRaw.map((intake) => ({
    id: intake.id,
    ticketNumber: intake.ticketNumber,
    vrNumber: null,
    scheduledDate: intake.scheduledDate,
    scheduledTimeWindow: intake.scheduledTimeWindow,
    estimatedWeight: intake.estimatedWeight,
    client: {
      companyName: intake.client.companyName,
      accountNumber: intake.client.accountNumber,
    },
    status: intake.status,
    deliveryType: intake.deliveryType,
    pickupAddress: intake.pickupAddress,
    wasteType: intake.wasteType,
  }));

  // Get upcoming (next 30 days)
  const upcomingIntakesRaw = await prisma.wasteIntake.findMany({
    where: {
      status: { in: ["pending", "approved", "scheduled"] },
      scheduledDate: {
        gte: now,
        lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    },
    include: {
      client: {
        select: { companyName: true, accountNumber: true },
      },
    },
    orderBy: { scheduledDate: "asc" },
    take: 20,
  });
  const upcomingIntakes: CalendarIntake[] = upcomingIntakesRaw.map((intake) => ({
    id: intake.id,
    ticketNumber: intake.ticketNumber,
    vrNumber: null,
    scheduledDate: intake.scheduledDate,
    scheduledTimeWindow: intake.scheduledTimeWindow,
    estimatedWeight: intake.estimatedWeight,
    client: {
      companyName: intake.client.companyName,
      accountNumber: intake.client.accountNumber,
    },
    status: intake.status,
    deliveryType: intake.deliveryType,
    pickupAddress: intake.pickupAddress,
    wasteType: intake.wasteType,
  }));

  // Get today's intakes
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const todayIntakesRaw = await prisma.wasteIntake.findMany({
    where: {
      status: { in: ["approved", "scheduled", "in_transit"] },
      scheduledDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      client: {
        select: { companyName: true, accountNumber: true },
      },
    },
    orderBy: { scheduledDate: "asc" },
  });
  const todayIntakes: CalendarIntake[] = todayIntakesRaw.map((intake) => ({
    id: intake.id,
    ticketNumber: intake.ticketNumber,
    vrNumber: null,
    scheduledDate: intake.scheduledDate,
    scheduledTimeWindow: intake.scheduledTimeWindow,
    estimatedWeight: intake.estimatedWeight,
    client: {
      companyName: intake.client.companyName,
      accountNumber: intake.client.accountNumber,
    },
    status: intake.status,
    deliveryType: intake.deliveryType,
    pickupAddress: intake.pickupAddress,
    wasteType: intake.wasteType,
  }));

  // Get all intakes for calendar
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const calendarIntakesRaw = await prisma.wasteIntake.findMany({
    where: {
      status: { in: ["approved", "scheduled", "in_transit"] },
      scheduledDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      client: {
        select: { companyName: true, accountNumber: true },
      },
    },
    orderBy: { scheduledDate: "asc" },
  });

  // Transform for calendar component with all needed fields
  const calendarIntakesWithFields: CalendarIntake[] = calendarIntakesRaw.map((intake) => ({
    id: intake.id,
    ticketNumber: intake.ticketNumber,
    vrNumber: null,
    scheduledDate: intake.scheduledDate,
    scheduledTimeWindow: intake.scheduledTimeWindow,
    estimatedWeight: intake.estimatedWeight,
    client: {
      companyName: intake.client.companyName,
      accountNumber: intake.client.accountNumber,
    },
  }));

  return {
    weekIntakes,
    upcomingIntakes,
    todayIntakes,
    calendarIntakes: calendarIntakesWithFields,
    startOfWeek,
  };
}

export default async function SchedulePage() {
  const data = await getScheduleData();

  // Calculate summary stats
  // Each load is ~44,000 lbs = ~22 tons (from Casey's emails)
  const TONS_PER_LOAD = 22;
  const totalLoads = data.calendarIntakes.length;
  const deliveredLoads = data.calendarIntakes.filter((i) => i.statusTag === "arrived" || i.statusTag === "moved").length;
  const scheduledLoads = totalLoads - deliveredLoads;
  const tonsDelivered = deliveredLoads * TONS_PER_LOAD;
  const tonsRemaining = scheduledLoads * TONS_PER_LOAD;
  const totalTons = totalLoads * TONS_PER_LOAD;

  // Build complete load list with all details
  // Use Arizona timezone for accurate "today" detection
  const nowAZ = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" }));
  const todayAZ = new Date(nowAZ.getFullYear(), nowAZ.getMonth(), nowAZ.getDate());

  const allLoads = data.calendarIntakes
    .sort((a, b) => +new Date(a.scheduledDate) - +new Date(b.scheduledDate))
    .map((intake, idx) => {
      const d = new Date(intake.scheduledDate);
      const loadDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const isDelivered = intake.statusTag === "arrived" || intake.statusTag === "moved";
      const isPast = loadDate < todayAZ;
      const isToday = loadDate.getTime() === todayAZ.getTime();
      return {
        ...intake,
        loadNumber: idx + 1,
        dateStr: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        isDelivered,
        isPast,
        isToday,
      };
    });

  const summaryContent = (
    <div className="space-y-8">
      {/* Hero Stats - Big and Clear */}
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center py-6 border-b-4 border-gray-200">
          <div className="text-5xl font-bold text-gray-900">{totalLoads}</div>
          <div className="text-sm text-gray-500 mt-1 uppercase tracking-wide">Total Loads</div>
          <div className="text-lg text-gray-400 mt-1">{totalTons} tons</div>
        </div>
        <div className="text-center py-6 border-b-4 border-emerald-500">
          <div className="text-5xl font-bold text-emerald-600">{deliveredLoads}</div>
          <div className="text-sm text-gray-500 mt-1 uppercase tracking-wide">Delivered</div>
          <div className="text-lg text-emerald-500 mt-1">{tonsDelivered} tons</div>
        </div>
        <div className="text-center py-6 border-b-4 border-amber-500">
          <div className="text-5xl font-bold text-amber-600">{scheduledLoads}</div>
          <div className="text-sm text-gray-500 mt-1 uppercase tracking-wide">Remaining</div>
          <div className="text-lg text-amber-500 mt-1">{tonsRemaining} tons</div>
        </div>
      </div>

      {/* Project Info - Clean Grid */}
      <div className="bg-white border rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <div className="text-gray-500 uppercase text-xs tracking-wide mb-1">Client</div>
            <div className="font-semibold text-gray-900">Vanguard Renewables</div>
          </div>
          <div>
            <div className="text-gray-500 uppercase text-xs tracking-wide mb-1">Origin</div>
            <div className="font-semibold text-gray-900">Flagstaff, AZ</div>
          </div>
          <div>
            <div className="text-gray-500 uppercase text-xs tracking-wide mb-1">Generator</div>
            <div className="font-semibold text-gray-900">Nestle Purina</div>
          </div>
          <div>
            <div className="text-gray-500 uppercase text-xs tracking-wide mb-1">Material</div>
            <div className="font-semibold text-gray-900">Off-spec pet food</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t text-xs text-gray-500">
          ~44,000 lbs (~22 tons) per load · Bags on slip sheets · Salmonella-contaminated product for composting
        </div>
      </div>

      {/* All Loads Table with Toggle */}
      <OverviewTable loads={allLoads} tonsPerLoad={20} />

      {/* Closed Days - Simple Notice */}
      <div className="text-sm text-gray-500 border-t pt-4">
        <span className="font-medium text-gray-700">Closed:</span> Dec 25 (Christmas) · Dec 30 - Jan 2 (Holiday) · Reopening Jan 5, 2026
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Schedule</h1>
          <p className="text-gray-500 mt-1">Vanguard / Purina Dog Food - Flagstaff</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Tabs
          tabs={[
            {
              label: "Overview",
              value: "summary",
              content: summaryContent,
            },
            {
              label: "Calendar",
              value: "calendar",
              content: <Calendar intakes={data.calendarIntakes} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
