"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, User, MapPin, FileText, DollarSign } from "lucide-react"

interface ClientFormProps {
  initialData?: {
    id?: string
    companyName: string
    operationalContact: string
    operationalEmail: string
    operationalPhone: string
    billingContact?: string
    billingEmail?: string
    billingPhone?: string
    address: string
    city: string
    state: string
    zipCode: string
    contractReference?: string
    tippingFeeRate: number
    notes?: string
  }
}

export function ClientForm({ initialData }: ClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const isEditing = !!initialData?.id

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const rawData = Object.fromEntries(formData.entries())

    // Build properly typed data object
    const data = {
      ...rawData,
      tippingFeeRate: parseFloat(rawData.tippingFeeRate as string) || 45.00,
    }

    try {
      const url = isEditing
        ? `/api/clients/${initialData.id}`
        : "/api/clients"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to save client")
      }

      const client = await response.json()
      router.push(`/clients/${client.id}`)
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

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-emerald-600" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            name="companyName"
            label="Company Name *"
            required
            defaultValue={initialData?.companyName}
            placeholder="Acme Waste Co."
          />
        </CardContent>
      </Card>

      {/* Operational Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <User className="h-5 w-5 mr-2 text-emerald-600" />
            Operational Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              name="operationalContact"
              label="Contact Name *"
              required
              defaultValue={initialData?.operationalContact}
              placeholder="John Smith"
            />
            <Input
              name="operationalEmail"
              label="Email *"
              type="email"
              required
              defaultValue={initialData?.operationalEmail}
              placeholder="john@acme.com"
            />
            <Input
              name="operationalPhone"
              label="Phone *"
              type="tel"
              required
              defaultValue={initialData?.operationalPhone}
              placeholder="(555) 555-5555"
            />
          </div>
        </CardContent>
      </Card>

      {/* Billing Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
            Billing Contact (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              name="billingContact"
              label="Contact Name"
              defaultValue={initialData?.billingContact || ""}
              placeholder="Jane Doe"
            />
            <Input
              name="billingEmail"
              label="Email"
              type="email"
              defaultValue={initialData?.billingEmail || ""}
              placeholder="billing@acme.com"
            />
            <Input
              name="billingPhone"
              label="Phone"
              type="tel"
              defaultValue={initialData?.billingPhone || ""}
              placeholder="(555) 555-5556"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            name="address"
            label="Street Address *"
            required
            defaultValue={initialData?.address}
            placeholder="123 Main Street"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Input
                name="city"
                label="City *"
                required
                defaultValue={initialData?.city}
                placeholder="San Francisco"
              />
            </div>
            <Input
              name="state"
              label="State *"
              required
              maxLength={2}
              defaultValue={initialData?.state}
              placeholder="CA"
            />
            <Input
              name="zipCode"
              label="ZIP Code *"
              required
              maxLength={10}
              defaultValue={initialData?.zipCode}
              placeholder="94102"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contract & Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-emerald-600" />
            Contract & Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="contractReference"
              label="Contract / MSPA Reference"
              defaultValue={initialData?.contractReference || ""}
              placeholder="MSA-2025-001"
            />
            <Input
              name="tippingFeeRate"
              label="Tipping Fee Rate ($/ton) *"
              type="number"
              step="0.01"
              required
              defaultValue={initialData?.tippingFeeRate || 45.00}
              placeholder="45.00"
            />
          </div>
          <Textarea
            name="notes"
            label="Notes"
            defaultValue={initialData?.notes || ""}
            placeholder="Any additional notes about this client..."
            rows={3}
          />
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
          {loading ? "Saving..." : isEditing ? "Update Client" : "Create Client"}
        </Button>
      </div>
    </form>
  )
}
