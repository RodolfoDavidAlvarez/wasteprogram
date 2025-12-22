"use client";

import { useMemo, useState } from "react";
import { Calculator, Download, Loader2, Send } from "lucide-react";
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
    origin: DEFAULT_ORIGIN,
    destination: "",
    grossWeight: "",
    tareWeight: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
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
      const response = await fetch("/api/weigh-ticket/save-and-email", {
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
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Failed to submit ticket");
      }

      const result = await response.json();
      if (result.dbSaveFailed) {
        setStatus({ 
          type: "success", 
          message: "Email sent to ralvarez@soilseedandwater.com with PDF attachment! (Note: Could not save to database - connection unavailable)" 
        });
      } else {
        setStatus({ type: "success", message: "Saved to database and emailed to ralvarez@soilseedandwater.com with PDF attachment" });
      }
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
        origin: DEFAULT_ORIGIN,
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

  const handleSaveAndDownload = async () => {
    setStatus(null);
    setSaving(true);

    try {
      const response = await fetch("/api/weigh-ticket/save-and-download", {
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
        const errorMsg = errorData?.detail || errorData?.error || "Failed to save and generate PDF";
        throw new Error(errorMsg);
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

      // Check if database save failed
      const dbSaveFailed = response.headers.get("X-Database-Save-Failed") === "true";
      if (dbSaveFailed) {
        setStatus({ 
          type: "success", 
          message: "PDF downloaded! (Note: Could not save to database - database connection unavailable)" 
        });
      } else {
        setStatus({ type: "success", message: "Saved to database and PDF downloaded!" });
      }
      
      // Reset form but keep ticket number and date
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
        origin: DEFAULT_ORIGIN,
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
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Scale House</p>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Submit Weigh Ticket</h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
              <Calculator className="h-4 w-4" />
              Net = Gross - Tare
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            All fields are optional. Fill in what you have and submit. Net weight auto-calculates when weights are provided. On submit, a copy is emailed to ralvarez@soilseedandwater.com.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Ticket #</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={form.ticketNumber}
                    onChange={(e) => handleChange("ticketNumber", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={form.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Time In <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={form.timeIn}
                    onChange={(e) => handleChange("timeIn", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Time Out <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={form.timeOut}
                    onChange={(e) => handleChange("timeOut", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Driver Name <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={form.driverName}
                    onChange={(e) => handleChange("driverName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Carrier / Company <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={form.carrierCompany}
                    onChange={(e) => handleChange("carrierCompany", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Truck # / Plate <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={form.truckNumber}
                    onChange={(e) => handleChange("truckNumber", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Trailer # <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={form.trailerNumber}
                    onChange={(e) => handleChange("trailerNumber", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Material Type <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={form.materialType}
                    onChange={(e) => handleChange("materialType", e.target.value)}
                    placeholder="e.g., Food Waste, Green Waste"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Reference / BOL # <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={form.referenceNumber}
                    onChange={(e) => handleChange("referenceNumber", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Origin <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={form.origin}
                    onChange={(e) => handleChange("origin", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Destination <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={form.destination}
                    onChange={(e) => handleChange("destination", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Gross Weight (lbs) <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={form.grossWeight}
                    onChange={(e) => handleChange("grossWeight", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Tare Weight (lbs) <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={form.tareWeight}
                    onChange={(e) => handleChange("tareWeight", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1 flex items-center justify-between">
                    Net Weight (lbs)
                    <span className="text-xs text-gray-400 font-normal">auto</span>
                  </label>
                  <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 min-h-[40px] flex items-center">
                    {net === null || Number.isNaN(net) ? "—" : `${net.toLocaleString()} lbs`}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Notes / Comments</label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </div>

              {status && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm border shadow-xs ${
                    status.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveAndDownload}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-white text-sm font-semibold shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save and Download PDF"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-white text-sm font-semibold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? "Sending..." : "Submit & Email"}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Blank PDF
                </button>
              </div>
            </form>
          </div>
    </div>
  );
}
