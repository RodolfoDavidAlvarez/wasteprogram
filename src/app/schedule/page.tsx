import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Calendar } from "@/components/schedule/Calendar";
import { prisma } from "@/lib/prisma";
import { formatDate, formatWeight, INTAKE_STATUSES } from "@/lib/utils";
import { Calendar as CalendarIcon, Truck, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";

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
  const y = 2025;
  const m = 11; // December (0-indexed)
  const date = (day: number) => new Date(y, m, day);

  // VR numbers from email thread (Casey Tucker / Vanguard)
  const calendarIntakes: CalendarIntake[] = [
    { id: "vr-121125-109", ticketNumber: "VR121125-109", vrNumber: "121125-109", scheduledDate: date(11), scheduledTimeWindow: "11:00-14:00", eta: "12:00", estimatedWeight: 0, client: { companyName: "Vanguard Renewables", accountNumber: "" }, statusTag: "arrived", status: "scheduled", deliveryType: "client_delivery", wasteType: "off-spec pet food" },
    { id: "vr-121125-110", ticketNumber: "VR121125-110", vrNumber: "121125-110", scheduledDate: date(11), scheduledTimeWindow: "11:00-14:00", eta: "13:00", estimatedWeight: 0, client: { companyName: "Vanguard Renewables", accountNumber: "" }, statusTag: "arrived", status: "scheduled", deliveryType: "client_delivery", wasteType: "off-spec pet food" },

    { id: "vr-121225-98", ticketNumber: "VR121225-98", vrNumber: "121225-98", scheduledDate: date(12), scheduledTimeWindow: "11:00-14:30", estimatedWeight: 0, client: { companyName: "Vanguard Renewables", accountNumber: "" }, statusTag: "arrived", status: "scheduled", deliveryType: "client_delivery", wasteType: "off-spec pet food" },
    { id: "vr-121225-99", ticketNumber: "VR121225-99", vrNumber: "121225-99", scheduledDate: date(12), scheduledTimeWindow: "11:00-14:30", estimatedWeight: 0, client: { companyName: "Vanguard Renewables", accountNumber: "" }, statusTag: "arrived", status: "scheduled", deliveryType: "client_delivery", wasteType: "off-spec pet food" },

    { id: "vr-121525-49", ticketNumber: "VR121525-49", vrNumber: "121525-49", scheduledDate: date(15), scheduledTimeWindow: "06:00-14:30", estimatedWeight: 0, client: { companyName: "Vanguard Renewables", accountNumber: "" }, statusTag: "arrived", status: "scheduled", deliveryType: "client_delivery", wasteType: "off-spec pet food" },

    // VR121525-50 had delays and moved; original date 12/15, ultimately delivered 12/17 ~15:00
    { id: "vr-121525-50", ticketNumber: "VR121525-50", vrNumber: "121525-50", scheduledDate: date(17), scheduledTimeWindow: "06:00-14:30", eta: "15:00", note: "Delayed from 12/15 (tire/late) → moved to 12/17", estimatedWeight: 0, client: { companyName: "Vanguard Renewables", accountNumber: "" }, statusTag: "moved", status: "scheduled", deliveryType: "client_delivery", wasteType: "off-spec pet food" },

    { id: "vr-121025-117", ticketNumber: "VR121025-117", vrNumber: "121025-117", scheduledDate: date(16), scheduledTimeWindow: "06:00-14:30", estimatedWeight: 0, client: { companyName: "Vanguard Renewables", accountNumber: "" }, statusTag: "arrived", status: "scheduled", deliveryType: "client_delivery", wasteType: "off-spec pet food" },
    { id: "vr-121625-45", ticketNumber: "VR121625-45", vrNumber: "121625-45", scheduledDate: date(16), scheduledTimeWindow: "06:00-14:30", eta: "14:20", note: "Arrived ~14:55 per update", estimatedWeight: 0, client: { companyName: "Vanguard Renewables", accountNumber: "" }, statusTag: "arrived", status: "scheduled", deliveryType: "client_delivery", wasteType: "off-spec pet food" },

    { id: "vr-121725-41", ticketNumber: "VR121725-41", vrNumber: "121725-41", scheduledDate: date(17), scheduledTimeWindow: "06:00-14:30", estimatedWeight: 0, client: { companyName: "Vanguard Renewables", accountNumber: "" }, statusTag: "scheduled", status: "scheduled", deliveryType: "client_delivery", wasteType: "off-spec pet food" },
    { id: "vr-121725-72", ticketNumber: "VR121725-72", vrNumber: "121725-72", scheduledDate: date(17), scheduledTimeWindow: "06:00-14:30", estimatedWeight: 0, client: { companyName: "Vanguard Renewables", accountNumber: "" }, statusTag: "scheduled", status: "scheduled", deliveryType: "client_delivery", wasteType: "off-spec pet food" },
    { id: "vr-121825-74", ticketNumber: "VR121825-74", vrNumber: "121825-74", scheduledDate: date(18), scheduledTimeWindow: "06:00-14:30", estimatedWeight: 0, client: { companyName: "Vanguard Renewables", accountNumber: "" }, statusTag: "scheduled", status: "scheduled", deliveryType: "client_delivery", wasteType: "off-spec pet food" },
  ];

  const todayIntakes = calendarIntakes.filter((i) => isSameDay(new Date(i.scheduledDate), now));
  const upcomingIntakes = calendarIntakes.filter((i) => new Date(i.scheduledDate) > now).sort((a, b) => +new Date(a.scheduledDate) - +new Date(b.scheduledDate));
  const weekIntakes = calendarIntakes.filter((i) => inRange(new Date(i.scheduledDate), startOfWeek, endOfWeek)).sort((a, b) => +new Date(a.scheduledDate) - +new Date(b.scheduledDate));

  return {
    weekIntakes,
    upcomingIntakes,
    todayIntakes,
    calendarIntakes,
    startOfWeek,
  };
}

async function getScheduleData() {
  // Allow public schedule page to deploy before DB is configured.
  if (!process.env.DATABASE_URL) {
    return getManualSchedule();
  }

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

function getStatusBadge(status: string) {
  const statusConfig = INTAKE_STATUSES.find((s) => s.value === status);
  const color = statusConfig?.color || "bg-gray-100 text-gray-800";
  const label = statusConfig?.label || status;

  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>{label}</span>;
}

export default async function SchedulePage() {
  const data = await getScheduleData();
  const now = new Date();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Group intakes by day of week
  const intakesByDay: Record<number, typeof data.weekIntakes> = {};
  daysOfWeek.forEach((_, i) => {
    intakesByDay[i] = [];
  });
  data.weekIntakes.forEach((intake) => {
    const day = new Date(intake.scheduledDate).getDay();
    intakesByDay[day].push(intake);
  });

  const weekViewContent = (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Button variant="outline" size="sm">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium px-4">Week of {formatDate(data.startOfWeek)}</span>
        <Button variant="outline" size="sm">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Week View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day, index) => {
              const dayDate = new Date(data.startOfWeek);
              dayDate.setDate(data.startOfWeek.getDate() + index);
              const isToday = dayDate.toDateString() === now.toDateString();
              const dayIntakes = intakesByDay[index];

              return (
                <div key={day} className={`border rounded-lg p-2 min-h-[150px] ${isToday ? "bg-emerald-50 border-emerald-300" : ""}`}>
                  <div className={`text-center text-sm font-medium mb-2 pb-2 border-b ${isToday ? "text-emerald-700" : "text-gray-600"}`}>
                    {day}
                    <br />
                    <span className={`text-lg ${isToday ? "font-bold" : ""}`}>{dayDate.getDate()}</span>
                  </div>
                  <div className="space-y-1">
                    {dayIntakes.map((intake) => (
                      <Link key={intake.id} href={`/intakes/${intake.id}`}>
                        <div className="text-xs bg-emerald-100 text-emerald-800 p-1 rounded truncate hover:bg-emerald-200">
                          <Truck className="h-3 w-3 inline mr-1" />
                          {intake.client.companyName}
                        </div>
                      </Link>
                    ))}
                    {dayIntakes.length === 0 && <p className="text-xs text-gray-400 text-center">-</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );

  const todayContent = (
    <Card className="border-emerald-200 bg-emerald-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center text-emerald-800">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Today - {formatDate(now)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.todayIntakes.length === 0 ? (
          <p className="text-emerald-700 text-center py-4">No pickups or deliveries scheduled for today</p>
        ) : (
          <div className="space-y-3">
            {data.todayIntakes.map((intake) => (
              <Link key={intake.id} href={`/intakes/${intake.id}`}>
                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-medium text-emerald-600">{intake.ticketNumber}</span>
                        {getStatusBadge(intake.status ?? "scheduled")}
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          {intake.deliveryType === "client_delivery" ? "Delivery" : "Pickup"}
                        </span>
                      </div>
                      <p className="font-medium mt-1">{intake.client.companyName}</p>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {intake.scheduledTimeWindow || "All day"}
                      </div>
                      {intake.pickupAddress && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {intake.pickupAddress}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatWeight(intake.estimatedWeight)}</p>
                      <p className="text-xs text-gray-500">{intake.wasteType ?? ""}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const upcomingContent = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Truck className="h-5 w-5 mr-2 text-emerald-600" />
          Upcoming (Next 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.upcomingIntakes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No upcoming pickups or deliveries</p>
        ) : (
          <div className="divide-y">
            {data.upcomingIntakes.map((intake) => (
              <Link key={intake.id} href={`/intakes/${intake.id}`}>
                <div className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 -mx-2 rounded">
                  <div className="flex items-center">
                    <div className="w-16 text-center mr-4">
                      <div className="text-xs text-gray-500 uppercase">
                        {new Date(intake.scheduledDate).toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className="text-lg font-bold text-emerald-600">{new Date(intake.scheduledDate).getDate()}</div>
                      <div className="text-xs text-gray-500">{new Date(intake.scheduledDate).toLocaleDateString("en-US", { month: "short" })}</div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm text-emerald-600">{intake.ticketNumber}</span>
                        {getStatusBadge(intake.status ?? "scheduled")}
                      </div>
                      <p className="font-medium">{intake.client.companyName}</p>
                      <p className="text-sm text-gray-500">
                        {intake.wasteType} | {intake.deliveryType === "client_delivery" ? "Delivery" : "Pickup"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatWeight(intake.estimatedWeight)}</p>
                    {intake.scheduledTimeWindow && <p className="text-xs text-gray-500">{intake.scheduledTimeWindow}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <Header title="Schedule" subtitle="Public pickup & delivery calendar" />
      <div className="p-6 space-y-6">
        {/* Public view: no admin actions */}

        {/* Tabbed Views */}
        <Tabs
          tabs={[
            {
              label: "Calendar",
              value: "calendar",
              content: <Calendar intakes={data.calendarIntakes} />,
            },
            {
              label: "Week View",
              value: "week",
              content: weekViewContent,
            },
            {
              label: "Today",
              value: "today",
              content: todayContent,
            },
            {
              label: "Upcoming",
              value: "upcoming",
              content: upcomingContent,
            },
          ]}
        />
      </div>
    </div>
  );
}
