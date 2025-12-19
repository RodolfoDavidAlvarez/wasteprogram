"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Calculator, Download, FileText, Loader2, Send } from "lucide-react";
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

export default function WeighTicketPage() {
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
    origin: "",
    destination: "",
    grossWeight: "",
    tareWeight: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const gross = parseFloat(form.grossWeight);
  const tare = parseFloat(form.tareWeight);
  const net = useMemo(() => {
    if (Number.isNaN(gross) || Number.isNaN(tare)) return null;
    return gross - tare;
  }, [gross, tare]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/weight-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          grossWeight: Number(form.grossWeight),
          tareWeight: Number(form.tareWeight),
          netWeight: net ?? undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Failed to submit ticket");
      }

      setStatus({ type: "success", message: "Sent to ralvarez@soilseedandwater.com" });
      setForm((prev) => ({
        ...prev,
        ticketNumber: generateWeightTicketNumber(),
        timeIn: "",
        timeOut: "",
        carrierCompany: "",
        driverName: "",
        truckNumber: "",
        trailerNumber: "",
        referenceNumber: "",
        materialType: "",
        origin: "",
        destination: "",
        grossWeight: "",
        tareWeight: "",
        notes: "",
      }));
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    const printWindow = window.open("/resources/weigh-ticket/print", "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-gray-50 to-white py-8 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-emerald-100/70 p-6 sm:p-7 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">
                  Scale House
                </p>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">Submit Weigh Ticket</h1>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Net weight auto-calculates from gross and tare. On submit, a copy is emailed to
                  <br className="hidden sm:block" /> ralvarez@soilseedandwater.com.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
                <Calculator className="h-4 w-4" />
                Net = Gross - Tare
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Ticket #</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                    value={form.ticketNumber}
                    onChange={(e) => handleChange("ticketNumber", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                    value={form.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">Time In</label>
                    <input
                      type="time"
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                      value={form.timeIn}
                      onChange={(e) => handleChange("timeIn", e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">Time Out</label>
                    <input
                      type="time"
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                      value={form.timeOut}
                      onChange={(e) => handleChange("timeOut", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Carrier / Company</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                    value={form.carrierCompany}
                    onChange={(e) => handleChange("carrierCompany", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Driver Name</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                    value={form.driverName}
                    onChange={(e) => handleChange("driverName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Truck # / Plate</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                    value={form.truckNumber}
                    onChange={(e) => handleChange("truckNumber", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Trailer #</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                    value={form.trailerNumber}
                    onChange={(e) => handleChange("trailerNumber", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Reference / BOL #</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                    value={form.referenceNumber}
                    onChange={(e) => handleChange("referenceNumber", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Material Type</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                    value={form.materialType}
                    onChange={(e) => handleChange("materialType", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Origin</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                    value={form.origin}
                    onChange={(e) => handleChange("origin", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Destination</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                    value={form.destination}
                    onChange={(e) => handleChange("destination", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Gross Weight (lbs)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                    value={form.grossWeight}
                    onChange={(e) => handleChange("grossWeight", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tare Weight (lbs)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                    value={form.tareWeight}
                    onChange={(e) => handleChange("tareWeight", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 flex items-center justify-between">
                    Net Weight (lbs)
                    <span className="text-xs text-gray-400">auto</span>
                  </div>
                  <div className="mt-1 w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800 min-h-[44px] flex items-center shadow-xs">
                    {net === null || Number.isNaN(net) ? "—" : `${net.toLocaleString()} lbs`}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Notes / Comments</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-xs"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </div>

              {status && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm border shadow-xs ${
                    status.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-white text-sm font-semibold shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? "Sending..." : "Submit & Email"}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Blank PDF
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-100 p-6 sm:p-7 lg:p-8 lg:sticky lg:top-6 h-fit">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-3">
                <FileText className="h-7 w-7 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Quick Guide</h2>
              <p className="text-sm text-gray-500 mt-1">Fill the fields, net weight is auto-calculated.</p>
            </div>
            <div className="space-y-5 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <ArrowRight className="h-4 w-4 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800">Gross - Tare = Net</p>
                  <p>Enter both weights in lbs; net fills in instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ArrowRight className="h-4 w-4 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800">Email goes to Rodolfo</p>
                  <p>On submit, a copy is sent to ralvarez@soilseedandwater.com for records.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ArrowRight className="h-4 w-4 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800">Need a blank copy?</p>
                  <p>Use “Download Blank PDF” to print and hand-write if needed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
