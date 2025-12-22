import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import {
  formatDate,
  formatWeight,
  formatCurrency,
  INTAKE_STATUSES,
  calculateCO2Avoided,
} from "@/lib/utils"
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  FileText,
  Truck,
  Plus,
  Leaf,
} from "lucide-react"

interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

async function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      intakes: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      contracts: true,
      _count: {
        select: { intakes: true },
      },
    },
  })
}

async function getClientStats(id: string) {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  const ytdStats = await prisma.wasteIntake.aggregate({
    where: {
      clientId: id,
      status: "received",
      receivedAt: { gte: startOfYear },
    },
    _sum: {
      actualWeight: true,
      totalCharge: true,
    },
    _count: true,
  })

  return {
    ytdWeight: ytdStats._sum.actualWeight || 0,
    ytdRevenue: ytdStats._sum.totalCharge || 0,
    ytdIntakes: ytdStats._count || 0,
  }
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params
  const [client, stats] = await Promise.all([
    getClient(id),
    getClientStats(id),
  ])

  if (!client) {
    notFound()
  }

  const co2Avoided = calculateCO2Avoided(stats.ytdWeight)

  const getStatusBadge = (status: string) => {
    const statusConfig = INTAKE_STATUSES.find((s) => s.value === status)
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          statusConfig?.color || "bg-gray-100 text-gray-800"
        }`}
      >
        {statusConfig?.label || status}
      </span>
    )
  }

  return (
    <div>
      <Header
        title={client.companyName}
        subtitle={`Account: ${client.accountNumber}`}
      />
      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/admin/clients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
          <div className="flex space-x-3">
            <Link href={`/admin/intake/new?clientId=${client.id}`}>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Intake
              </Button>
            </Link>
            <Link href={`/admin/clients/${client.id}/edit`}>
              <Button size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Truck className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
                  <p className="text-2xl font-bold">{client._count.intakes}</p>
                  <p className="text-xs text-gray-500">Total Intakes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{stats.ytdWeight.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Tons (YTD)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(stats.ytdRevenue)}
                  </p>
                  <p className="text-xs text-gray-500">Revenue (YTD)</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50">
                <CardContent className="p-4 text-center">
                  <Leaf className="h-6 w-6 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-700">
                    {co2Avoided.toFixed(1)}
                  </p>
                  <p className="text-xs text-green-600">Tons CO2 Avoided</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Intakes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Intakes</CardTitle>
                <Link href={`/admin/intakes?clientId=${client.id}`}>
                  <Button variant="ghost" size="sm" className="text-emerald-600">
                    View all
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {client.intakes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Truck className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No intakes yet</p>
                    <Link href={`/admin/intake/new?clientId=${client.id}`}>
                      <Button variant="outline" size="sm" className="mt-4">
                        Create First Intake
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {client.intakes.map((intake) => (
                      <Link
                        key={intake.id}
                        href={`/admin/intakes/${intake.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div>
                            <div className="flex items-center space-x-3">
                              <span className="font-mono text-sm font-medium text-emerald-600">
                                {intake.ticketNumber}
                              </span>
                              {getStatusBadge(intake.status)}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {intake.wasteType} - {formatDate(intake.scheduledDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {intake.actualWeight
                                ? formatWeight(intake.actualWeight)
                                : formatWeight(intake.estimatedWeight)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Operational Contact
                  </label>
                  <p className="text-gray-900">{client.operationalContact}</p>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {client.operationalEmail}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {client.operationalPhone}
                  </div>
                </div>

                {client.billingContact && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500">
                      Billing Contact
                    </label>
                    <p className="text-gray-900">{client.billingContact}</p>
                    {client.billingEmail && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {client.billingEmail}
                      </div>
                    )}
                    {client.billingPhone && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {client.billingPhone}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900">{client.address}</p>
                <p className="text-gray-900">
                  {client.city}, {client.state} {client.zipCode}
                </p>
              </CardContent>
            </Card>

            {/* Contract & Billing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-gray-400" />
                  Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tipping Fee Rate
                  </label>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatCurrency(client.tippingFeeRate)} / ton
                  </p>
                </div>
                {client.contractReference && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Contract Reference
                    </label>
                    <p className="text-gray-900">{client.contractReference}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {client.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {client.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
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
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm">{formatDate(client.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
