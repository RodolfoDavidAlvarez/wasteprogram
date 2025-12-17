"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  WASTE_TYPES,
  PACKAGING_TYPES,
  VEHICLE_TYPES,
  CONTAMINANT_TYPES,
} from "@/lib/utils"
import { AlertTriangle, Truck, Package, Calendar, FileText } from "lucide-react"

interface Client {
  id: string
  companyName: string
  accountNumber: string
  tippingFeeRate: number
}

interface IntakeFormProps {
  clients: Client[]
}

export function IntakeForm({ clients }: IntakeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [deliveryType, setDeliveryType] = useState("client_delivery")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const rawData = Object.fromEntries(formData.entries())

    // Build properly typed data object with checkbox conversions
    const isRecurring = formData.get("isRecurring") === "on"
    const hasOdorConcerns = formData.get("hasOdorConcerns") === "on"
    const hasLeakageConcerns = formData.get("hasLeakageConcerns") === "on"
    const contaminationCertified = formData.get("contaminationCertified") === "on"

    const data = {
      ...rawData,
      isRecurring,
      hasOdorConcerns,
      hasLeakageConcerns,
      contaminationCertified,
    }

    if (!contaminationCertified) {
      setError("You must certify that no prohibited materials are present")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/intakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create intake")
      }

      const intake = await response.json()
      router.push(`/intakes/${intake.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-emerald-600" />
            Client & Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            name="clientId"
            label="Select Client *"
            required
            options={clients.map((client) => ({
              value: client.id,
              label: `${client.companyName} (${client.accountNumber})`,
            }))}
          />
          <Input
            name="poNumber"
            label="PO / Contract Reference"
            placeholder="Optional reference number"
          />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              name="wasteType"
              label="Waste Type *"
              required
              options={WASTE_TYPES}
            />
            <Select
              name="packagingType"
              label="Packaging / Container Type *"
              required
              options={PACKAGING_TYPES}
            />
          </div>
          <Textarea
            name="wasteDescription"
            label="Waste Description"
            placeholder="Additional details about the material..."
            rows={2}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              name="estimatedWeight"
              label="Estimated Weight (tons) *"
              required
              step="0.01"
              min="0"
              placeholder="e.g., 5.5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Truck className="h-5 w-5 mr-2 text-emerald-600" />
            Delivery / Pickup Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              name="deliveryType"
              label="Delivery Type *"
              required
              value={deliveryType}
              onChange={(e) => setDeliveryType(e.target.value)}
              options={[
                { value: "client_delivery", label: "Client Will Deliver" },
                { value: "ssw_pickup", label: "SSW Pickup Required" },
              ]}
            />
            <Select
              name="vehicleType"
              label="Vehicle Type"
              options={VEHICLE_TYPES}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              name="scheduledDate"
              label="Requested Date *"
              required
            />
            <Select
              name="scheduledTimeWindow"
              label="Time Window"
              options={[
                { value: "6AM-8AM", label: "6:00 AM - 8:00 AM" },
                { value: "8AM-10AM", label: "8:00 AM - 10:00 AM" },
                { value: "10AM-12PM", label: "10:00 AM - 12:00 PM" },
                { value: "12PM-2PM", label: "12:00 PM - 2:00 PM" },
                { value: "2PM-4PM", label: "2:00 PM - 4:00 PM" },
                { value: "4PM-6PM", label: "4:00 PM - 6:00 PM" },
              ]}
            />
          </div>

          {deliveryType === "ssw_pickup" && (
            <>
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-3">Pickup Location</h4>
                <Input
                  name="pickupAddress"
                  label="Street Address *"
                  required={deliveryType === "ssw_pickup"}
                  placeholder="123 Main Street"
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <Input
                    name="pickupCity"
                    label="City *"
                    required={deliveryType === "ssw_pickup"}
                  />
                  <Input
                    name="pickupState"
                    label="State *"
                    required={deliveryType === "ssw_pickup"}
                    maxLength={2}
                    placeholder="CA"
                  />
                  <Input
                    name="pickupZip"
                    label="ZIP *"
                    required={deliveryType === "ssw_pickup"}
                    maxLength={10}
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <Input
              name="onSiteContact"
              label="On-Site Contact Name"
              placeholder="Person to contact at location"
            />
            <Input
              name="onSitePhone"
              label="On-Site Contact Phone"
              type="tel"
              placeholder="(555) 555-5555"
            />
          </div>
          <Input
            name="driverContact"
            label="Driver Contact (if known)"
            placeholder="Driver name and phone"
          />
        </CardContent>
      </Card>

      {/* Schedule Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
            Schedule & Frequency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Checkbox name="isRecurring" label="This is a recurring pickup/delivery" />
          <Select
            name="recurringFrequency"
            label="Frequency (if recurring)"
            options={[
              { value: "weekly", label: "Weekly" },
              { value: "bi_weekly", label: "Bi-Weekly" },
              { value: "monthly", label: "Monthly" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Special Handling */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Special Handling Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            name="temperatureRequirement"
            label="Temperature / Freshness"
            options={[
              { value: "ambient", label: "Ambient Temperature" },
              { value: "refrigerated", label: "Refrigerated" },
              { value: "frozen", label: "Frozen" },
            ]}
          />
          <div className="flex flex-wrap gap-4">
            <Checkbox name="hasOdorConcerns" label="Strong odor expected" />
            <Checkbox name="hasLeakageConcerns" label="Potential leakage concerns" />
          </div>
          <Input
            name="equipmentNeeded"
            label="Equipment Needed"
            placeholder="e.g., Forklift, pallet jack, specific containers..."
          />
          <Textarea
            name="specialInstructions"
            label="Additional Instructions"
            placeholder="Any other special handling requirements, site access notes, etc."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Contamination Compliance */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-amber-800">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Contamination Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-amber-200">
            <p className="text-sm text-gray-700 mb-3">
              The following materials are <strong>NOT ACCEPTED</strong> and must
              not be present in the waste load:
            </p>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {CONTAMINANT_TYPES.map((type) => (
                <li key={type.value} className="flex items-center text-red-600">
                  <span className="mr-1">✕</span> {type.label}
                </li>
              ))}
            </ul>
          </div>
          <Textarea
            name="contaminationNotes"
            label="Notes on Potential Minor Contaminants (if any)"
            placeholder="Disclose any known minor contaminants that may be present..."
            rows={2}
          />
          <div className="bg-white p-4 rounded-lg border-2 border-amber-300">
            <Checkbox
              name="contaminationCertified"
              label="I certify that this load does NOT contain any prohibited materials listed above. I understand that loads containing prohibited materials may be rejected or subject to additional fees."
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Intake Request"}
        </Button>
      </div>
    </form>
  )
}
