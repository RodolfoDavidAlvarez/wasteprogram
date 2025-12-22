"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { X, Camera, CheckCircle2, Loader2, Trash2, Undo2, Pencil, FileText, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  weightTicketUrls?: string[];
};

interface DeliveryRecordSidebarProps {
  vrNumber: string | null;
  loadNumber?: number;
  onClose: () => void;
  onUpdate?: () => void;
}

async function fetchRecord(vrNumber: string): Promise<DeliveryRecordUi | null> {
  try {
    const res = await fetch(`/api/schedule/delivery-record/${encodeURIComponent(vrNumber)}`, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Failed to fetch record for ${vrNumber}:`, res.status, res.statusText);
      return null;
    }
    const data = await res.json();
    if (data.error) {
      console.error(`API error for ${vrNumber}:`, data.error);
      return null;
    }
    return data?.record ?? null;
  } catch (error) {
    console.error(`Error fetching record for ${vrNumber}:`, error);
    return null;
  }
}

export function DeliveryRecordSidebar({ vrNumber, loadNumber, onClose, onUpdate }: DeliveryRecordSidebarProps) {
  const [record, setRecord] = useState<DeliveryRecordUi | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingTicket, setUploadingTicket] = useState(false);
  const [marking, setMarking] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [editingWeight, setEditingWeight] = useState(false);
  const [weightLbs, setWeightLbs] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const weightTicketInputRef = useRef<HTMLInputElement>(null);

  // PIN protection hook
  const { requestPin, PinDialogComponent } = usePinProtection();

  // Photo lightbox state
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const photos = useMemo(() => record?.photoUrls ?? [], [record]);
  const weightTickets = useMemo(() => record?.weightTicketUrls ?? [], [record]);
  const isDelivered = record?.status === "delivered";

  // Determine if this is a loading type record and get weight ticket path
  const getWeightTicketPath = (vrNum: string | null): string | null => {
    if (!vrNum) return null;
    // Check if it's a BOL number (format: BOL-YYMMDD-XX)
    if (vrNum.startsWith("BOL-")) {
      const ticketNum = vrNum.replace("BOL-", "");
      // Extract date parts: YYMMDD-XX (e.g., 121925-01)
      const dateMatch = ticketNum.match(/^(\d{6})-(\d+)$/);
      if (dateMatch) {
        const [, datePart, ticketPart] = dateMatch;
        // datePart is YYMMDD, convert to YYYY-MM-DD
        const year = "20" + datePart.substring(0, 2);
        const month = datePart.substring(2, 4);
        const day = datePart.substring(4, 6);
        // Return path to public folder (served from root)
        return `/weigh-tickets/${year}-${month}-${day}/weigh-ticket-${ticketPart}.html`;
      }
    }
    return null;
  };

  const weightTicketPath = getWeightTicketPath(vrNumber);
  const isLoadingType = weightTicketPath !== null || (record?.notes?.toLowerCase().includes("empty and full weight") || record?.notes?.toLowerCase().includes("license plate"));

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (vrNumber) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [vrNumber]);

  // Handle escape key to close sidebar
  useEffect(() => {
    if (!vrNumber) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [vrNumber, onClose]);

  useEffect(() => {
    if (!vrNumber) {
      setRecord(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setRecord(null); // Clear previous record while loading
    
    fetchRecord(vrNumber)
      .then((r) => {
        if (!cancelled) {
          setRecord(r);
          if (r?.tonnage) {
            setWeightLbs(String(Math.round(r.tonnage * 2000)));
          } else {
            setWeightLbs("40000"); // Default to 20 tons if no tonnage
          }
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Error loading record:", error);
          setRecord(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vrNumber]);

  const refresh = async () => {
    if (!vrNumber) return;
    const r = await fetchRecord(vrNumber);
    setRecord(r);
    if (r?.tonnage) {
      setWeightLbs(String(Math.round(r.tonnage * 2000)));
    }
    if (onUpdate) onUpdate();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vrNumber) return;
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

  const handleWeightTicketSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vrNumber) return;
    setUploadingTicket(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("vrNumber", vrNumber);
      const res = await fetch("/api/schedule/upload-weight-ticket", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      await refresh();
      alert("Weight ticket uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload weight ticket.");
    } finally {
      setUploadingTicket(false);
      if (weightTicketInputRef.current) weightTicketInputRef.current.value = "";
    }
  };

  const handleDeleteWeightTicket = async (ticketUrl: string) => {
    if (!vrNumber || !confirm("Are you sure you want to delete this weight ticket?")) return;
    try {
      const res = await fetch("/api/schedule/delete-weight-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vrNumber, weightTicketUrl: ticketUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete weight ticket");
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete weight ticket.");
    }
  };

  const doMarkDelivered = async () => {
    if (!vrNumber) return;
    setMarking(true);
    try {
      const res = await fetch("/api/schedule/mark-delivered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vrNumber, deliveredBy: "Field Team" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to mark as delivered");
      await refresh();
      alert("Load marked as delivered successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to mark as delivered.");
    } finally {
      setMarking(false);
    }
  };

  const handleMarkDelivered = () => {
    if (!vrNumber) return;
    requestPin(doMarkDelivered, {
      title: "Confirm Delivery",
      description: "Enter admin PIN to mark this load as delivered",
    });
  };

  const doUndoDelivery = async () => {
    if (!vrNumber) return;
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
      alert("Delivery status undone successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to undo delivery.");
    } finally {
      setUndoing(false);
    }
  };

  const handleUndoDelivery = () => {
    if (!vrNumber) return;
    requestPin(doUndoDelivery, {
      title: "Undo Delivery",
      description: "Enter admin PIN to undo delivery status",
    });
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!vrNumber || !confirm("Are you sure you want to delete this photo?")) return;
    try {
      const res = await fetch("/api/schedule/delete-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vrNumber, photoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete photo");
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete photo.");
    }
  };

  const handleSaveWeight = async () => {
    if (!vrNumber || !weightLbs) return;
    const weight = parseFloat(weightLbs);
    if (isNaN(weight) || weight <= 0) {
      alert("Please enter a valid weight in pounds.");
      return;
    }
    setSavingWeight(true);
    try {
      const res = await fetch("/api/schedule/update-weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vrNumber, weightLbs: weight }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update weight");
      await refresh();
      setEditingWeight(false);
      alert("Weight updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update weight.");
    } finally {
      setSavingWeight(false);
    }
  };

  if (!vrNumber) return null;

  return (
    <>
      {PinDialogComponent}
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity cursor-pointer"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close sidebar"
      />

      {/* Sidebar */}
      <div 
        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-[101] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 font-mono">
            VR {vrNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500">Loading record...</span>
            </div>
          ) : !record ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-gray-500">No record found for VR {vrNumber}</p>
              <p className="text-sm text-gray-400">The record should be created automatically. Please try refreshing.</p>
              <button
                onClick={() => {
                  setLoading(true);
                  fetchRecord(vrNumber).then((r) => {
                    setRecord(r);
                    setLoading(false);
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                {isDelivered ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    Delivered
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                    <Clock className="h-4 w-4" />
                    Scheduled
                  </span>
                )}
                {loadNumber && (
                  <span className="text-sm text-gray-500">Truck Load #{loadNumber}</span>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Scheduled Date</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(record.scheduledDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>

                {isDelivered && record.deliveredAt && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivered At</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(record.deliveredAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    {record.deliveredBy && (
                      <div className="text-xs text-gray-500 mt-1">By {record.deliveredBy}</div>
                    )}
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tonnage</div>
                  {editingWeight ? (
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={weightLbs}
                        onChange={(e) => setWeightLbs(e.target.value)}
                        placeholder="Weight in lbs"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveWeight}
                          disabled={savingWeight}
                          className="text-xs"
                        >
                          {savingWeight ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingWeight(false);
                            if (record.tonnage) {
                              setWeightLbs(String(Math.round(record.tonnage * 2000)));
                            }
                          }}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{record.tonnage.toFixed(2)} tons</div>
                        <div className="text-xs text-gray-500">{Math.round(record.tonnage * 2000).toLocaleString()} lbs</div>
                      </div>
                      <button
                        onClick={() => setEditingWeight(true)}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        aria-label="Edit weight"
                      >
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>

                {record.notes && (
                  <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</div>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">{record.notes}</div>
                  </div>
                )}
              </div>

              {/* Weight Ticket Section - For Loading Type Records */}
              {(isLoadingType || weightTickets.length > 0) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Weight Ticket Documents</h3>
                    </div>
                    <label className="cursor-pointer">
                      <input
                        ref={weightTicketInputRef}
                        type="file"
                        accept=".pdf,.html,application/pdf,text/html"
                        onChange={handleWeightTicketSelect}
                        className="hidden"
                      />
                      <Button
                        size="sm"
                        disabled={uploadingTicket}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        {uploadingTicket ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        {uploadingTicket ? "Uploading..." : "Upload Ticket"}
                      </Button>
                    </label>
                  </div>

                  {/* Auto-detected weight ticket link (from BOL number) */}
                  {weightTicketPath && (
                    <div className="mb-3 pb-3 border-b border-blue-200">
                      <div className="text-sm text-gray-700 mb-2">
                        <div className="font-medium mb-1">Auto-detected Weight Ticket:</div>
                        <a
                          href={weightTicketPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Ticket
                        </a>
                      </div>
                      {record.tonnage > 0 && (
                        <div className="text-xs text-gray-600 mt-2">
                          Net Weight: {record.tonnage.toFixed(2)} tons ({Math.round(record.tonnage * 2000).toLocaleString()} lbs)
                        </div>
                      )}
                    </div>
                  )}

                  {/* Uploaded weight tickets */}
                  {weightTickets.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        Uploaded Tickets ({weightTickets.length})
                      </div>
                      {weightTickets.map((ticketUrl, idx) => {
                        const isPdf = ticketUrl.toLowerCase().endsWith(".pdf") || ticketUrl.includes("application/pdf");
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-white rounded border border-blue-200 group"
                          >
                            <a
                              href={ticketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 flex-1"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="truncate">
                                Weight Ticket {idx + 1} {isPdf ? "(PDF)" : "(HTML)"}
                              </span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                            <button
                              onClick={() => handleDeleteWeightTicket(ticketUrl)}
                              className="p-1.5 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                              aria-label="Delete weight ticket"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {weightTickets.length === 0 && !weightTicketPath && (
                    <div className="text-sm text-gray-600 text-center py-4 border-2 border-dashed border-blue-300 rounded">
                      No weight tickets uploaded yet. Upload a PDF or HTML file above.
                    </div>
                  )}
                </div>
              )}

              {/* Photos Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Documentation Photos</h3>
                  <label className="cursor-pointer">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      disabled={uploading}
                      className="gap-2"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      {uploading ? "Uploading..." : "Add Photo"}
                    </Button>
                  </label>
                </div>

                {photos.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No photos uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <div
                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                          onClick={() => {
                            setLightboxIndex(idx);
                            setShowLightbox(true);
                          }}
                        >
                          <Image
                            src={url}
                            alt={`Photo ${idx + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <button
                          onClick={() => handleDeletePhoto(url)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          aria-label="Delete photo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6 space-y-3">
                {isDelivered ? (
                  <Button
                    onClick={handleUndoDelivery}
                    disabled={undoing}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    {undoing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Undo2 className="h-4 w-4" />
                    )}
                    {undoing ? "Undoing..." : "Undo Delivery"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleMarkDelivered}
                    disabled={marking}
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {marking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {marking ? "Marking..." : "Mark as Delivered"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Photo Lightbox */}
      <PhotoLightbox
        photos={photos}
        initialIndex={lightboxIndex}
        open={showLightbox}
        onClose={() => setShowLightbox(false)}
        onDelete={async (photoUrl) => {
          if (!vrNumber) return;
          try {
            const res = await fetch("/api/schedule/delete-photo", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ vrNumber, photoUrl }),
            });
            const data = await res.json();
            if (data.success) {
              await refresh();
            }
          } catch (err) {
            console.error("Failed to delete photo:", err);
            alert("Failed to delete photo.");
          }
        }}
      />
    </>
  );
}

