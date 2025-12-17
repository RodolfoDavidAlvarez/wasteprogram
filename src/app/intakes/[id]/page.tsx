import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import {
  formatDate,
  formatDateTime,
  formatWeight,
  formatCurrency,
  INTAKE_STATUSES,
  WASTE_TYPES,
  PACKAGING_TYPES,
} from "@/lib/utils"
import {
  ArrowLeft,
  Building2,
  Package,
  Truck,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Printer,
  FileText,
  Camera,
  Weight,
  Clock,
  MapPin,
} from "lucide-react"
import { SubmitBOLButton } from "@/components/intakes/SubmitBOLButton"

interface IntakeDetailPageProps {
  params: Promise<{ id: string }>
}

async function getIntake(id: string) {
  return prisma.wasteIntake.findUnique({
    where: { id },
    include: {
      client: true,
      contaminationReports: true,
    },
  })
}

export default async function IntakeDetailPage({ params }: IntakeDetailPageProps) {
  const { id } = await params
  const intake = await getIntake(id)

  if (!intake) {
    notFound()
  }

  const statusConfig = INTAKE_STATUSES.find((s) => s.value === intake.status)
  const wasteTypeLabel = WASTE_TYPES.find((t) => t.value === intake.wasteType)?.label || intake.wasteType
  const packagingLabel = PACKAGING_TYPES.find((p) => p.value === intake.packagingType)?.label || intake.packagingType

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/schedule">
              <Button variant="ghost" size="sm" className="px-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Printer className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Link href={`/intakes/${intake.id}/edit`}>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Edit className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Ticket Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              <h1 className="text-xl font-bold font-mono text-emerald-600">{intake.ticketNumber}</h1>
            </div>
            <p className="text-gray-600">{intake.client.companyName}</p>
            <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${statusConfig?.color || "bg-gray-100"}`}>
              {statusConfig?.label || intake.status}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Submit BOL Button - Prominent at top for mobile */}
        <SubmitBOLButton intakeId={intake.id} ticketNumber={intake.ticketNumber} />

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Weight className="h-4 w-4" />
                <span className="text-xs">Estimated</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{formatWeight(intake.estimatedWeight)}</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Scheduled</span>
              </div>
              <p className="text-sm font-semibold">{formatDate(intake.scheduledDate)}</p>
              {intake.scheduledTimeWindow && (
                <p className="text-xs text-gray-500">{intake.scheduledTimeWindow}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-emerald-600" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Company</label>
                <p className="text-sm font-medium">{intake.client.companyName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Account</label>
                  <p className="text-sm font-mono">{intake.client.accountNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Contact</label>
                  <p className="text-sm">{intake.client.operationalContact}</p>
                </div>
              </div>
              {intake.poNumber && (
                <div>
                  <label className="text-xs font-medium text-gray-500">PO / Reference</label>
                  <p className="text-sm">{intake.poNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Waste Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Package className="h-5 w-5 mr-2 text-emerald-600" />
                Waste Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Type</label>
                  <p className="text-sm">{wasteTypeLabel}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Packaging</label>
                  <p className="text-sm">{packagingLabel}</p>
                </div>
                {intake.actualWeight && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Actual Weight</label>
                    <p className="text-sm font-semibold text-emerald-600">{formatWeight(intake.actualWeight)}</p>
                  </div>
                )}
              </div>
              {intake.wasteDescription && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-700">{intake.wasteDescription}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Truck className="h-5 w-5 mr-2 text-emerald-600" />
                Logistics & Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Delivery Type</label>
                  <p className="text-sm">
                    {intake.deliveryType === "client_delivery" ? "Client Delivery" : "SSW Pickup"}
                  </p>
                </div>
                {intake.vehicleType && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Vehicle</label>
                    <p className="text-sm">{intake.vehicleType}</p>
                  </div>
                )}
              </div>
              {intake.driverContact && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Driver/Contact</label>
                  <p className="text-sm">{intake.driverContact}</p>
                </div>
              )}
              {intake.specialInstructions && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <label className="text-xs font-medium text-amber-900">Special Instructions</label>
                  <p className="text-sm text-amber-800 mt-1">{intake.specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance Notes */}
          {intake.contaminationNotes && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                  Compliance Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{intake.contaminationNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Destination */}
          {intake.destinationSite && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
                  Destination Site
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{intake.destinationSite}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
