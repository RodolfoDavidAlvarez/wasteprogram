import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatDate, CONTAMINANT_TYPES } from "@/lib/utils";
import { AlertTriangle, CheckCircle, XCircle, Filter, TrendingDown } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getContaminationData() {
  // Allow deployments to succeed before a DB is configured.
  if (!process.env.DATABASE_URL) {
    return {
      reports: [],
      contaminatedIntakes: [],
      stats: {
        totalIntakesYTD: 0,
        contaminationCountYTD: 0,
        contaminationCountMonth: 0,
        contaminationRate: "0",
      },
      byType: [],
      bySeverity: [],
    };
  }

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all contamination reports
  const reports = await prisma.contaminationReport.findMany({
    include: {
      intake: {
        include: {
          client: {
            select: { companyName: true, accountNumber: true },
          },
        },
      },
    },
    orderBy: { reportedAt: "desc" },
    take: 50,
  });

  // Get intakes with contamination found
  const contaminatedIntakes = await prisma.wasteIntake.findMany({
    where: {
      contaminationFound: true,
      receivedAt: { gte: startOfYear },
    },
    include: {
      client: {
        select: { companyName: true },
      },
    },
    orderBy: { receivedAt: "desc" },
  });

  // Stats
  const totalIntakesYTD = await prisma.wasteIntake.count({
    where: {
      status: "received",
      receivedAt: { gte: startOfYear },
    },
  });

  const contaminationCountYTD = await prisma.wasteIntake.count({
    where: {
      contaminationFound: true,
      receivedAt: { gte: startOfYear },
    },
  });

  const contaminationCountMonth = await prisma.wasteIntake.count({
    where: {
      contaminationFound: true,
      receivedAt: { gte: startOfMonth },
    },
  });

  // Contamination by type
  const byType = await prisma.contaminationReport.groupBy({
    by: ["contaminantType"],
    _count: true,
    where: {
      reportedAt: { gte: startOfYear },
    },
  });

  // By severity
  const bySeverity = await prisma.contaminationReport.groupBy({
    by: ["severity"],
    _count: true,
    where: {
      reportedAt: { gte: startOfYear },
    },
  });

  return {
    reports,
    contaminatedIntakes,
    stats: {
      totalIntakesYTD,
      contaminationCountYTD,
      contaminationCountMonth,
      contaminationRate: totalIntakesYTD > 0 ? ((contaminationCountYTD / totalIntakesYTD) * 100).toFixed(1) : "0",
    },
    byType,
    bySeverity,
  };
}

export default async function ContaminationPage() {
  const data = await getContaminationData();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor":
        return "bg-yellow-100 text-yellow-800";
      case "moderate":
        return "bg-orange-100 text-orange-800";
      case "severe":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getContaminantLabel = (type: string) => {
    return CONTAMINANT_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <div>
      <Header title="Contamination Log" subtitle="Track and manage contamination incidents" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">YTD Incidents</p>
                  <p className="text-2xl font-bold">{data.stats.contaminationCountYTD}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="text-2xl font-bold">{data.stats.contaminationCountMonth}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Contamination Rate</p>
                  <p className="text-2xl font-bold">{data.stats.contaminationRate}%</p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Clean Intakes</p>
                  <p className="text-2xl font-bold text-green-600">{data.stats.totalIntakesYTD - data.stats.contaminationCountYTD}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* By Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">By Contaminant Type (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.byType.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No incidents recorded</p>
              ) : (
                <div className="space-y-3">
                  {data.byType.map((item) => (
                    <div key={item.contaminantType} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{item.contaminantType.replace(/_/g, " ")}</span>
                      <span className="font-semibold">{item._count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* By Severity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">By Severity (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.bySeverity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No incidents recorded</p>
              ) : (
                <div className="space-y-3">
                  {data.bySeverity.map((item) => (
                    <div key={item.severity} className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(item.severity)}`}>{item.severity}</span>
                      <span className="font-semibold">{item._count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prohibited Materials Reference */}
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-800 flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                Prohibited Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-red-700">
                {CONTAMINANT_TYPES.map((type) => (
                  <li key={type.value} className="flex items-center">
                    <span className="mr-2">✕</span>
                    {type.label}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recent Contamination Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Recent Contamination Reports
            </CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </CardHeader>
          <CardContent>
            {data.reports.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-300 mb-2" />
                <p className="text-gray-500">No contamination reports on file</p>
                <p className="text-sm text-gray-400">Great job keeping waste streams clean!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contaminant</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">View</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(report.reportedAt)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link href={`/intakes/${report.intake.id}`} className="font-mono text-sm text-emerald-600 hover:text-emerald-800">
                            {report.intake.ticketNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{report.intake.client.companyName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{getContaminantLabel(report.contaminantType)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(report.severity)}`}>{report.severity}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{report.actionTaken || "-"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <Link href={`/intakes/${report.intake.id}`} className="text-emerald-600 hover:text-emerald-800">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Intakes with Contamination */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Intakes with Contamination (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.contaminatedIntakes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No contaminated intakes this year</p>
            ) : (
              <div className="space-y-3">
                {data.contaminatedIntakes.map((intake) => (
                  <Link key={intake.id} href={`/intakes/${intake.id}`}>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <div>
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="font-mono text-sm font-medium">{intake.ticketNumber}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {intake.client.companyName} - {intake.wasteType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{formatDate(intake.receivedAt || intake.scheduledDate)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
