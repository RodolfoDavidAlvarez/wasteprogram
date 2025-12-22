import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { Scale, FileText, Truck, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getScaleHouseData() {
  if (!process.env.DATABASE_URL) {
    return {
      recentTransactions: [],
      stats: { transactions: 0, bols: 0, trucks: 0, drivers: 0 },
    };
  }

  try {
    const [transactionCount, bolCount, truckCount, driverCount, recentTransactions] = await Promise.all([
      prisma.scaleTransaction.count(),
      prisma.billOfLading.count(),
      prisma.companyTruck.count(),
      prisma.driver.count(),
      prisma.scaleTransaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { companyName: true } },
        },
      }),
    ]);

    return {
      stats: {
        transactions: transactionCount,
        bols: bolCount,
        trucks: truckCount,
        drivers: driverCount,
      },
      recentTransactions,
    };
  } catch (error) {
    console.error("Scale House data error:", error);
    return {
      recentTransactions: [],
      stats: { transactions: 0, bols: 0, trucks: 0, drivers: 0 },
    };
  }
}

export default async function ScaleHousePage() {
  const data = await getScaleHouseData();

  return (
    <div>
      <Header title="Scale House" subtitle="Weight Tickets & Bills of Lading" />
      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/resources/weigh-ticket"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Scale className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">New Weight Ticket</h3>
                  <p className="text-sm text-gray-500">Record incoming/outgoing weight</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
          </Link>

          <div className="bg-white rounded-lg border border-gray-200 p-6 opacity-60">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">New BOL</h3>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 opacity-60">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Trucks</h3>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 opacity-60">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Drivers</h3>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{data.stats.transactions}</div>
            <div className="text-sm text-gray-500">Weight Tickets</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{data.stats.bols}</div>
            <div className="text-sm text-gray-500">Bills of Lading</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{data.stats.trucks}</div>
            <div className="text-sm text-gray-500">Company Trucks</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{data.stats.drivers}</div>
            <div className="text-sm text-gray-500">Drivers</div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="p-6">
            {data.recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Scale className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No transactions yet</p>
                <p className="text-sm mt-1">Create your first weight ticket to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{tx.ticketNumber}</div>
                      <div className="text-sm text-gray-500">{tx.client?.companyName || "Unknown Client"}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {tx.netWeight ? `${tx.netWeight.toFixed(2)} tons` : "Pending"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
