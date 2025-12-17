import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { Plus, Building2, Phone, Mail } from "lucide-react"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function getClients() {
  if (!process.env.DATABASE_URL) return []

  return prisma.client.findMany({
    include: {
      _count: {
        select: { intakes: true },
      },
      intakes: {
        where: { status: "received" },
        select: { actualWeight: true },
      },
    },
    orderBy: { companyName: "asc" },
  })
}

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div>
      <Header
        title="Clients"
        subtitle="Manage waste supplier accounts"
      />
      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500">
            {clients.length} total clients
          </div>
          <Link href="/clients/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </Link>
        </div>

        {/* Clients Grid */}
        {clients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No clients yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Get started by adding your first waste supplier client.
              </p>
              <Link href="/clients/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Client
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => {
              const totalWeight = client.intakes.reduce(
                (sum, intake) => sum + (intake.actualWeight || 0),
                0
              )
              return (
                <Link key={client.id} href={`/clients/${client.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {client.companyName}
                          </h3>
                          <p className="text-sm font-mono text-gray-500">
                            {client.accountNumber}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            client.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {client.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {client.operationalEmail}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {client.operationalPhone}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-lg font-semibold text-gray-900">
                              {client._count.intakes}
                            </p>
                            <p className="text-xs text-gray-500">Intakes</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-900">
                              {totalWeight.toFixed(1)}
                            </p>
                            <p className="text-xs text-gray-500">Tons</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-emerald-600">
                              {formatCurrency(client.tippingFeeRate)}
                            </p>
                            <p className="text-xs text-gray-500">/ton</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
