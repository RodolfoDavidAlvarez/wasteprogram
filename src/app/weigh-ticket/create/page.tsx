"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { generateWeightTicketNumber } from "@/lib/utils";

type FormState = {
  ticketNumber: string;
  date: string;
  timeIn: string;
  timeOut: string;
  carrierCompany: string;
  driverName: string;
  truckNumber: string;
  trailerNumber: string;
  referenceNumber: string;
  materialType: string;
  origin: string;
  destination: string;
  grossWeight: string;
  tareWeight: string;
  notes: string;
};

const DEFAULT_ORIGIN = "18980 Stanton Rd, Congress, AZ 85332";

export default function CreateWeighTicketPage() {
  const [form, setForm] = useState<FormState>({
    ticketNumber: generateWeightTicketNumber(),
    date: new Date().toISOString().split("T")[0],
    timeIn: "",
    timeOut: "",
    carrierCompany: "",
    driverName: "",
    truckNumber: "",
    trailerNumber: "",
    referenceNumber: "",
    materialType: "",
    origin: DEFAULT_ORIGIN,
    destination: "",
    grossWeight: "",
    tareWeight: "",
    notes: "",
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gross = parseFloat(form.grossWeight);
  const tare = parseFloat(form.tareWeight);
  const net = useMemo(() => {
    if (Number.isNaN(gross) || Number.isNaN(tare)) return null;
    return gross - tare;
  }, [gross, tare]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGeneratePDF = async () => {
    setError(null);
    setGenerating(true);

    try {
      const response = await fetch("/api/weigh-ticket/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          grossWeight: form.grossWeight ? Number(form.grossWeight) : undefined,
          tareWeight: form.tareWeight ? Number(form.tareWeight) : undefined,
          netWeight: net ?? undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `weigh-ticket-${form.ticketNumber || "new"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-gray-50 to-white py-4 px-4 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-emerald-100/70 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Public Weigh Ticket Creator</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">Create Weigh Ticket</h1>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              Fill in the fields below (all optional). Net weight calculates automatically. Click &quot;Generate PDF&quot; to download your weigh ticket.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Ticket Number and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Ticket #</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  value={form.ticketNumber}
                  onChange={(e) => handleChange("ticketNumber", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </div>
            </div>

            {/* Time In/Out */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Time In</label>
                <input
                  type="time"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  value={form.timeIn}
                  onChange={(e) => handleChange("timeIn", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Time Out</label>
                <input
                  type="time"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  value={form.timeOut}
                  onChange={(e) => handleChange("timeOut", e.target.value)}
                />
              </div>
            </div>

            {/* Carrier and Driver */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Carrier / Company</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  value={form.carrierCompany}
                  onChange={(e) => handleChange("carrierCompany", e.target.value)}
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Driver Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  value={form.driverName}
                  onChange={(e) => handleChange("driverName", e.target.value)}
                  placeholder="Driver name"
                />
              </div>
            </div>

            {/* Truck and Trailer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Truck # / Plate</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  value={form.truckNumber}
                  onChange={(e) => handleChange("truckNumber", e.target.value)}
                  placeholder="Truck number"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Trailer #</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  value={form.trailerNumber}
                  onChange={(e) => handleChange("trailerNumber", e.target.value)}
                  placeholder="Trailer number"
                />
              </div>
            </div>

            {/* Material and Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Material Type</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  value={form.materialType}
                  onChange={(e) => handleChange("materialType", e.target.value)}
                  placeholder="e.g., Food Waste, Green Waste"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Reference / BOL #</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  value={form.referenceNumber}
                  onChange={(e) => handleChange("referenceNumber", e.target.value)}
                  placeholder="Reference number"
                />
              </div>
            </div>

            {/* Origin and Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Origin</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  value={form.origin}
                  onChange={(e) => handleChange("origin", e.target.value)}
                  placeholder="Origin address"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Destination</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  value={form.destination}
                  onChange={(e) => handleChange("destination", e.target.value)}
                  placeholder="Destination address"
                />
              </div>
            </div>

            {/* Weights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Gross Weight (lbs)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  value={form.grossWeight}
                  onChange={(e) => handleChange("grossWeight", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Tare Weight (lbs)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  value={form.tareWeight}
                  onChange={(e) => handleChange("tareWeight", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1 flex items-center justify-between">
                  Net Weight (lbs)
                  <span className="text-xs text-gray-400 font-normal">auto</span>
                </label>
                <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800 min-h-[44px] flex items-center shadow-xs">
                  {net === null || Number.isNaN(net) ? "—" : `${net.toLocaleString()} lbs`}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Notes / Comments</label>
              <textarea
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs resize-none"
                rows={3}
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional notes or comments..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg px-4 py-3 text-sm bg-rose-50 text-rose-800 border border-rose-200 shadow-xs">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGeneratePDF}
              disabled={generating}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-white text-sm font-semibold shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

