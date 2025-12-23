"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  companyName: string;
  accountNumber: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
}

export default function NewDealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [formData, setFormData] = useState({
    dealName: "",
    clientId: "",
    contactId: "",
    materialType: "dog_food",
    materialDescription: "",
    estimatedTonnage: "",
    rateType: "tipping_fee",
    ratePerTon: "",
    totalLoads: "",
    deliveryMethod: "client_delivery",
    pickupLocation: "",
    startDate: "",
    endDate: "",
    stage: "active",
    poNumber: "",
    vrNumbers: "",
    contractRef: "",
    notes: "",
  });

  useEffect(() => {
    // Fetch clients
    fetch("/api/clients")
      .then((res) => res.json())
      .then(setClients)
      .catch(console.error);

    // Fetch contacts
    fetch("/api/contacts")
      .then((res) => res.json())
      .then(setContacts)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          estimatedTonnage: formData.estimatedTonnage ? parseFloat(formData.estimatedTonnage) : null,
          ratePerTon: parseFloat(formData.ratePerTon),
          totalLoads: formData.totalLoads ? parseInt(formData.totalLoads) : null,
          clientId: formData.clientId || null,
          contactId: formData.contactId || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create deal");

      const deal = await response.json();
      router.push(`/admin/deals/${deal.id}`);
    } catch (error) {
      console.error("Error creating deal:", error);
      alert("Failed to create deal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div>
      <Header title="New Deal" subtitle="Create a new waste diversion deal" />
      <div className="p-6">
        <Link href="/admin/deals" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Deals
        </Link>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Deal Name *</label>
                  <Input
                    name="dealName"
                    value={formData.dealName}
                    onChange={handleChange}
                    placeholder="e.g., Vanguard Dog Food - Batch 1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Client</label>
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.companyName} ({client.accountNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contact</label>
                  <select
                    name="contactId"
                    value={formData.contactId}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a contact...</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName} - {contact.company}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Stage</label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="lead">Lead</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Material & Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Material & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Material Type *</label>
                  <select
                    name="materialType"
                    value={formData.materialType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="dog_food">Dog Food</option>
                    <option value="cat_food">Cat Food</option>
                    <option value="food_waste">Food Waste</option>
                    <option value="green_waste">Green Waste</option>
                    <option value="wood_chips">Wood Chips</option>
                    <option value="manure">Manure</option>
                    <option value="brewery_grain">Brewery Grain</option>
                    <option value="expired_produce">Expired Produce</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Material Description</label>
                  <Input
                    name="materialDescription"
                    value={formData.materialDescription}
                    onChange={handleChange}
                    placeholder="e.g., Salmonella-contaminated, in packaging on slip sheets"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Rate Type *</label>
                  <select
                    name="rateType"
                    value={formData.rateType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="tipping_fee">Tipping Fee (They pay us)</option>
                    <option value="purchase">Purchase (We pay them)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Rate per Ton ($) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    name="ratePerTon"
                    value={formData.ratePerTon}
                    onChange={handleChange}
                    placeholder="e.g., 45.00"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Est. Tonnage</label>
                    <Input
                      type="number"
                      step="0.01"
                      name="estimatedTonnage"
                      value={formData.estimatedTonnage}
                      onChange={handleChange}
                      placeholder="e.g., 176.49"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Loads</label>
                    <Input
                      type="number"
                      name="totalLoads"
                      value={formData.totalLoads}
                      onChange={handleChange}
                      placeholder="e.g., 11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logistics */}
            <Card>
              <CardHeader>
                <CardTitle>Logistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Method</label>
                  <select
                    name="deliveryMethod"
                    value={formData.deliveryMethod}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="client_delivery">Client Delivery</option>
                    <option value="ssw_pickup">SSW Pickup</option>
                    <option value="third_party">Third Party</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Pickup Location</label>
                  <Input
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    placeholder="Address if SSW pickup"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <Input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <Input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* References & Notes */}
            <Card>
              <CardHeader>
                <CardTitle>References & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">PO Number</label>
                  <Input
                    name="poNumber"
                    value={formData.poNumber}
                    onChange={handleChange}
                    placeholder="Client's PO number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">VR Numbers</label>
                  <Input
                    name="vrNumbers"
                    value={formData.vrNumbers}
                    onChange={handleChange}
                    placeholder="e.g., VR121125-109, VR121125-110"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contract Reference</label>
                  <Input
                    name="contractRef"
                    value={formData.contractRef}
                    onChange={handleChange}
                    placeholder="e.g., Stand-Alone Agreement"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <Textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Additional notes about this deal..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={loading} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
