"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Camera, CheckCircle2, Loader2, Trash2, Undo2, Scale, Pencil, FileText, Truck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleTheme } from "../../ScheduleTheme";
import { usePinProtection } from "@/components/ui/pin-dialog";
import { PhotoLightbox } from "@/components/ui/photo-lightbox";

type DeliveryRecordUi = {
  vrNumber: string;
  status: string;
  loadNumber: number;
  scheduledDate: string;
  deliveredAt: string | null;
  deliveredBy: string | null;
  notes: string | null;
  tonnage: number;
  photoUrls: string[];
};

async function fetchRecord(vrNumber: string): Promise<DeliveryRecordUi | null> {
  const res = await fetch(`/api/schedule/delivery-record/${encodeURIComponent(vrNumber)}`, { cache: "no-store" });
  const data = await res.json();
  return data?.record ?? null;
}

export default function DeliveryRecordPageClient({ vrNumber }: { vrNumber: string }) {
  const [record, setRecord] = useState<DeliveryRecordUi | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [editingWeight, setEditingWeight] = useState(false);
  const [weightLbs, setWeightLbs] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PIN protection hook
  const { requestPin, PinDialogComponent } = usePinProtection();

  // Photo lightbox state
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const photos = useMemo(() => record?.photoUrls ?? [], [record]);
  const isDelivered = record?.status === "delivered";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRecord(vrNumber)
      .then((r) => {
        if (!cancelled) setRecord(r);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vrNumber]);

  const refresh = async () => {
    const r = await fetchRecord(vrNumber);
    setRecord(r);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("vrNumber", vrNumber);
      const res = await fetch("/api/schedule/upload-photo", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to upload photo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const doMarkDelivered = async () => {
    setMarking(true);
    try {
      const res = await fetch("/api/schedule/mark-delivered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vrNumber, deliveredBy: "Field Team" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to mark delivered");
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to mark delivered.");
    } finally {
      setMarking(false);
    }
  };

  const handleMarkDelivered = () => {
    requestPin(doMarkDelivered, {
      title: "Confirm Delivery",
      description: "Enter admin PIN to mark this load as delivered",
    });
  };

  const doUndoDelivery = async () => {
    setUndoing(true);
    try {
      const res = await fetch("/api/schedule/undo-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vrNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to undo delivery");
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to undo delivery status.");
    } finally {
      setUndoing(false);
    }
  };

  const handleUndoDelivery = () => {
    requestPin(doUndoDelivery, {
      title: "Undo Delivery",
      description: "Enter admin PIN to revert this load to scheduled status",
    });
  };

  const doDeletePhoto = async (photoUrl: string) => {
    setDeleting(true);
    try {
      const res = await fetch("/api/schedule/delete-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vrNumber, photoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete photo");
      // If we were viewing the deleted photo in lightbox, close or adjust
      if (showLightbox && photos[lightboxIndex] === photoUrl) {
        if (photos.length <= 1) {
          setShowLightbox(false);
        } else if (lightboxIndex >= photos.length - 1) {
          setLightboxIndex(lightboxIndex - 1);
        }
      }
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete photo.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeletePhoto = (photoUrl: string) => {
    requestPin(() => doDeletePhoto(photoUrl), {
      title: "Delete Photo",
      description: "Enter admin PIN to delete this photo",
    });
  };

  const doSaveWeight = async () => {
    const lbs = parseFloat(weightLbs);
    if (isNaN(lbs) || lbs <= 0) {
      alert("Please enter a valid weight in pounds");
      return;
    }
    setSavingWeight(true);
    try {
      const res = await fetch("/api/schedule/update-weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vrNumber, weightLbs: lbs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update weight");
      await refresh();
      setEditingWeight(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update weight.");
    } finally {
      setSavingWeight(false);
    }
  };

  const handleSaveWeight = () => {
    requestPin(doSaveWeight, {
      title: "Update Weight",
      description: "Enter admin PIN to update the recorded weight",
    });
  };

  // Helper to format weight
  const formatWeight = (tons: number) => {
    const lbs = tons * 2000;
    return `${lbs.toLocaleString()} lbs (${tons.toFixed(2)} tons)`;
  };

  // BOL metadata for outbound deliveries
  const bolData: Record<
    string,
    {
      ticketNumber: string;
      licensePlate: string;
      trailer?: string;
      destination: string;
      origin: string;
      materialType: string;
      grossWeight: number;
      tareWeight: number;
      netWeight: number;
      timeIn: string;
      timeOut: string;
      scaleOperator: string;
      weighTicketPath: string;
    }
  > = {
    "BOL-121925-01": {
      ticketNumber: "121925-01",
      licensePlate: "4UH4601",
      trailer: "141359",
      destination: "Robinson Calf Ranch, 1001 East Hosking Avenue, Bakersfield CA 93307",
      origin: "18980 Stanton Rd, Congress, AZ 85332",
      materialType: "Waste",
      grossWeight: 74660,
      tareWeight: 36120,
      netWeight: 38540,
      timeIn: "9:00 AM",
      timeOut: "10:00 AM",
      scaleOperator: "SC",
      weighTicketPath: "/weigh-tickets/2025-12-19/weigh-ticket-1.html",
    },
    "BOL-121925-02": {
      ticketNumber: "121925-02",
      licensePlate: "4NC8490",
      destination: "Robinson Calf Ranch, 1001 East Hosking Avenue, Bakersfield CA 93307",
      origin: "18980 Stanton Rd, Congress, AZ 85332",
      materialType: "Waste",
      grossWeight: 71340,
      tareWeight: 36120,
      netWeight: 35220,
      timeIn: "10:00 AM",
      timeOut: "10:50 AM",
      scaleOperator: "SC",
      weighTicketPath: "/weigh-tickets/2025-12-19/weigh-ticket-2.html",
    },
  };

  const isBOL = vrNumber.startsWith("BOL-");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const bolInfo = bolData[vrNumber];

  return (
    <div className="min-h-screen schedule-theme app-background">
      <ScheduleTheme />
      {PinDialogComponent}
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Back Button */}
        <Link href="/schedule" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 py-2 -ml-2">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back</span>
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : !record ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No record found for VR {vrNumber}</p>
          </div>
        ) : (
          <>
            {/* VR Number Header */}
            <div className="text-center py-4">
              <h1 className="text-2xl font-bold text-gray-900 font-mono">VR {vrNumber}</h1>
              <p className="text-gray-500 mt-1">Truck Load #{record.loadNumber}</p>
              {isBOL && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold">
                  <Truck className="h-4 w-4" />
                  Outbound Delivery from Congress
                </div>
              )}
            </div>

            {/* BOL Details Card */}
            {isBOL && bolInfo && (
              <div className="bg-white rounded-xl border-2 border-blue-200 overflow-hidden">
                {/* BOL Header */}
                <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h2 className="font-bold text-blue-900">Bill of Lading & Weigh Ticket</h2>
                    </div>
                    <a
                      href={bolInfo.weighTicketPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      View Weigh Ticket
                    </a>
                  </div>
                </div>

                {/* BOL Details Grid */}
                <div className="p-4 space-y-3">
                  {/* Truck Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">License Plate</p>
                      <p className="text-lg font-bold text-gray-900 font-mono">{bolInfo.licensePlate}</p>
                    </div>
                    {bolInfo.trailer && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-medium mb-1">Trailer #</p>
                        <p className="text-lg font-bold text-gray-900 font-mono">{bolInfo.trailer}</p>
                      </div>
                    )}
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">Time In</p>
                      <p className="font-semibold text-gray-900">{bolInfo.timeIn}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">Time Out</p>
                      <p className="font-semibold text-gray-900">{bolInfo.timeOut}</p>
                    </div>
                  </div>

                  {/* Weights */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-emerald-900 mb-3">Scale Weights</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Gross</p>
                        <p className="font-bold text-gray-900">{bolInfo.grossWeight.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">lbs</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Tare</p>
                        <p className="font-bold text-gray-900">{bolInfo.tareWeight.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">lbs</p>
                      </div>
                      <div className="bg-emerald-600 text-white rounded-lg p-2">
                        <p className="text-xs mb-1">Net</p>
                        <p className="font-bold text-lg">{bolInfo.netWeight.toLocaleString()}</p>
                        <p className="text-xs opacity-90">{(bolInfo.netWeight / 2000).toFixed(2)} tons</p>
                      </div>
                    </div>
                  </div>

                  {/* Origin/Destination */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Origin</p>
                        <p className="text-sm text-gray-900">{bolInfo.origin}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Destination</p>
                        <p className="text-sm font-semibold text-blue-900">{bolInfo.destination}</p>
                      </div>
                    </div>
                  </div>

                  {/* Material & Operator */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Material Type</p>
                      <p className="text-sm font-semibold text-gray-900">{bolInfo.materialType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Scale Operator</p>
                      <p className="text-sm font-semibold text-gray-900">{bolInfo.scaleOperator}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Card */}
            <div className={`rounded-xl p-6 text-center ${isDelivered ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-900"}`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                {isDelivered && <CheckCircle2 className="h-6 w-6" />}
                <span className="text-xl font-bold">{isDelivered ? "Delivered" : "Pending Delivery"}</span>
              </div>
              {isDelivered && record.deliveredAt && <p className="text-sm opacity-90">{new Date(record.deliveredAt).toLocaleString()}</p>}
            </div>

            {/* Weight Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-gray-500" />
                  <h2 className="font-semibold text-gray-900">Net Weight</h2>
                </div>
                {!editingWeight && (
                  <button
                    onClick={() => {
                      setWeightLbs((record.tonnage * 2000).toString());
                      setEditingWeight(true);
                    }}
                    className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                )}
              </div>

              {editingWeight ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Weight in pounds</label>
                    <input
                      type="number"
                      value={weightLbs}
                      onChange={(e) => setWeightLbs(e.target.value)}
                      placeholder="e.g., 42500"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {weightLbs && !isNaN(parseFloat(weightLbs)) && (
                      <p className="text-sm text-gray-500 mt-1">= {(parseFloat(weightLbs) / 2000).toFixed(2)} tons</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveWeight} disabled={savingWeight} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      {savingWeight ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                        </>
                      ) : (
                        "Save Weight"
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingWeight(false)} disabled={savingWeight}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-2xl font-bold text-gray-900">{formatWeight(record.tonnage)}</p>
                </div>
              )}
            </div>

            {/* Photo Documentation */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Documentation</h2>
                <span className="text-sm text-gray-500">
                  {photos.length} photo{photos.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Photo Grid */}
              {photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {photos.map((url, idx) => (
                    <div key={url} className="relative group">
                      <button
                        onClick={() => {
                          setLightboxIndex(idx);
                          setShowLightbox(true);
                        }}
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-400 transition-colors w-full"
                      >
                        <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" unoptimized />
                      </button>
                      {/* Delete button overlay */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(url);
                        }}
                        disabled={deleting}
                        className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      >
                        {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 mb-4">
                  <Camera className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No photos yet</p>
                </div>
              )}

              {/* Add Photo Button */}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" /> Add Photo
                  </>
                )}
              </Button>
            </div>

            {/* Mark as Delivered Button */}
            {!isDelivered && (
              <Button
                onClick={handleMarkDelivered}
                disabled={marking}
                className="w-full h-14 text-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg"
              >
                {marking ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Marking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" /> Mark as Delivered
                  </>
                )}
              </Button>
            )}

            {/* Undo Delivery Button (only show when delivered) */}
            {isDelivered && (
              <Button
                onClick={handleUndoDelivery}
                disabled={undoing}
                variant="outline"
                className="w-full h-12 text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                {undoing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Reverting...
                  </>
                ) : (
                  <>
                    <Undo2 className="h-4 w-4 mr-2" /> Undo Delivery Status
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>

      {/* Photo Lightbox with Zoom */}
      <PhotoLightbox
        photos={photos}
        initialIndex={lightboxIndex}
        open={showLightbox}
        onClose={() => setShowLightbox(false)}
        onDelete={handleDeletePhoto}
        deleting={deleting}
      />
    </div>
  );
}


