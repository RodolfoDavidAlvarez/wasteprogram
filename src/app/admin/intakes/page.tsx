import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate, formatWeight, INTAKE_STATUSES, WASTE_TYPES } from "@/lib/utils";
import { Plus, Filter, Search } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getIntakes() {
  if (!process.env.DATABASE_URL) return [];

  try {
    return await prisma.wasteIntake.findMany({
      include: {
        client: {
          select: {
            companyName: true,
            accountNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return [];
  }
}

export default async function IntakesPage() {
  const intakes = await getIntakes();

  const getStatusBadge = (status: string) => {
    const statusConfig = INTAKE_STATUSES.find((s) => s.value === status);
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusConfig?.color || "bg-gray-100 text-gray-800"}`}
      >
        {statusConfig?.label || status}
      </span>
    );
  };

  const getWasteTypeLabel = (type: string) => {
    return WASTE_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <div>
      <Header title="Waste Intakes" subtitle="Manage all waste intake requests and tickets" />
      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <div className="text-sm text-gray-500">{intakes.length} total intakes</div>
          </div>
          <Link href="/admin/intake/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Intake
            </Button>
          </Link>
        </div>

        {/* Intakes List */}
        {intakes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No intakes yet</h3>
              <p className="mt-2 text-sm text-gray-500">Get started by creating your first waste intake request.</p>
              <Link href="/admin/intake/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Intake
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waste Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {intakes.map((intake) => (
                  <tr key={intake.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/intakes/${intake.id}`} className="font-mono text-sm font-medium text-emerald-600 hover:text-emerald-800">
                        {intake.ticketNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{intake.client.companyName}</div>
                      <div className="text-xs text-gray-500">{intake.client.accountNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getWasteTypeLabel(intake.wasteType)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {intake.actualWeight ? formatWeight(intake.actualWeight) : formatWeight(intake.estimatedWeight)}
                      </div>
                      <div className="text-xs text-gray-500">{intake.actualWeight ? "Actual" : "Estimated"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(intake.scheduledDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(intake.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link href={`/admin/intakes/${intake.id}`} className="text-emerald-600 hover:text-emerald-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
