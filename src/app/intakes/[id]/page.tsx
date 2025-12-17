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
} from "lucide-react"

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
    <div>
      <Header
        title={`Intake ${intake.ticketNumber}`}
        subtitle={`${intake.client.companyName} - ${wasteTypeLabel}`}
      />
      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/intakes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Intakes
            </Button>
          </Link>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Link href={`/intakes/${intake.id}/edit`}>
              <Button size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`rounded-lg p-4 mb-6 ${statusConfig?.color || "bg-gray-100"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {intake.status === "received" ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : intake.status === "rejected" || intake.status === "cancelled" ? (
                <XCircle className="h-5 w-5 mr-2" />
              ) : (
                <Truck className="h-5 w-5 mr-2" />
              )}
              <span className="font-semibold">{statusConfig?.label || intake.status}</span>
            </div>
            {intake.approvedBy && (
              <span className="text-sm">
                Approved by {intake.approvedBy} on{" "}
                {intake.approvedAt ? formatDateTime(intake.approvedAt) : "N/A"}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-emerald-600" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Company</label>
                  <p className="text-gray-900">{intake.client.companyName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account</label>
                  <p className="font-mono text-gray-900">{intake.client.accountNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact</label>
                  <p className="text-gray-900">{intake.client.operationalContact}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{intake.client.operationalEmail}</p>
                </div>
                {intake.poNumber && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">PO / Reference</label>
                    <p className="text-gray-900">{intake.poNumber}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Waste Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Package className="h-5 w-5 mr-2 text-emerald-600" />
                  Waste Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-gray-900">{wasteTypeLabel}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Packaging</label>
                    <p className="text-gray-900">{packagingLabel}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estimated Weight</label>
                    <p className="text-gray-900">{formatWeight(intake.estimatedWeight)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Actual Weight</label>
                    <p className="text-gray-900 font-semibold">
                      {intake.actualWeight ? formatWeight(intake.actualWeight) : "Not recorded"}
                    </p>
                  </div>
                </div>
                {intake.wasteDescription && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{intake.wasteDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Logistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-emerald-600" />
                  Logistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Delivery Type</label>
                    <p className="text-gray-900">
                      {intake.deliveryType === "client_delivery"
                        ? "Client Delivery"
                        : "SSW Pickup"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vehicle Type</label>
                    <p className="text-gray-900">{intake.vehicleType || "Not specified"}</p>
                  </div>
                </div>
                {intake.deliveryType === "ssw_pickup" && intake.pickupAddress && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Pickup Address</label>
                    <p className="text-gray-900">
                      {intake.pickupAddress}
                      {intake.pickupCity && `, ${intake.pickupCity}`}
                      {intake.pickupState && `, ${intake.pickupState}`}
                      {intake.pickupZip && ` ${intake.pickupZip}`}
                    </p>
                  </div>
                )}
                {intake.onSiteContact && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">On-Site Contact</label>
                      <p className="text-gray-900">{intake.onSiteContact}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{intake.onSitePhone || "N/A"}</p>
                    </div>
                  </div>
                )}
                {intake.specialInstructions && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Special Instructions</label>
                    <p className="text-gray-900">{intake.specialInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contamination Compliance */}
            <Card className={intake.contaminationFound ? "border-red-300" : ""}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className={`h-5 w-5 mr-2 ${intake.contaminationFound ? "text-red-600" : "text-amber-600"}`} />
                  Contamination & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-2">Client Certified Clean:</span>
                  {intake.contaminationCertified ? (
                    <span className="inline-flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" /> No
                    </span>
                  )}
                </div>
                {intake.contaminationNotes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Client Notes</label>
                    <p className="text-gray-900">{intake.contaminationNotes}</p>
                  </div>
                )}
                {intake.inspectionPassed !== null && (
                  <div className="border-t pt-4">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-500 mr-2">Inspection Result:</span>
                      {intake.inspectionPassed ? (
                        <span className="inline-flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" /> Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-1" /> Failed
                        </span>
                      )}
                    </div>
                    {intake.inspectionNotes && (
                      <p className="text-sm text-gray-700">{intake.inspectionNotes}</p>
                    )}
                  </div>
                )}
                {intake.contaminationReports.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-red-600 mb-2">Contamination Reports</h4>
                    {intake.contaminationReports.map((report) => (
                      <div key={report.id} className="bg-red-50 p-3 rounded-lg mb-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{report.contaminantType}</span>
                          <span className="text-sm text-gray-500">
                            Severity: {report.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{report.description}</p>
                        {report.actionTaken && (
                          <p className="text-sm text-gray-500 mt-1">
                            Action: {report.actionTaken}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Requested Date</label>
                  <p className="text-gray-900">{formatDate(intake.scheduledDate)}</p>
                  {intake.scheduledTimeWindow && (
                    <p className="text-sm text-gray-500">{intake.scheduledTimeWindow}</p>
                  )}
                </div>
                {intake.confirmedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Confirmed Date</label>
                    <p className="text-gray-900">{formatDate(intake.confirmedDate)}</p>
                  </div>
                )}
                {intake.receivedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Received At</label>
                    <p className="text-gray-900">{formatDateTime(intake.receivedAt)}</p>
                  </div>
                )}
                {intake.isRecurring && (
                  <div className="bg-emerald-50 p-2 rounded">
                    <span className="text-sm font-medium text-emerald-700">
                      Recurring: {intake.recurringFrequency}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Billing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipping Fee Rate</label>
                  <p className="text-gray-900">
                    {formatCurrency(intake.tippingFeeRate || 0)} / ton
                  </p>
                </div>
                {intake.actualWeight && intake.tippingFeeRate && (
                  <div className="border-t pt-3">
                    <label className="text-sm font-medium text-gray-500">Total Charge</label>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(intake.actualWeight * intake.tippingFeeRate)}
                    </p>
                  </div>
                )}
                {intake.invoiceId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Invoice</label>
                    <p className="font-mono text-gray-900">{intake.invoiceId}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Processing */}
            {intake.destinationSite && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Processing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Destination Site</label>
                    <p className="text-gray-900">{intake.destinationSite}</p>
                  </div>
                  {intake.processingNote && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Notes</label>
                      <p className="text-gray-900">{intake.processingNote}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span>{formatDateTime(intake.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated</span>
                    <span>{formatDateTime(intake.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
