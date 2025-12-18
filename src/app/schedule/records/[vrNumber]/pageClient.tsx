"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Camera, CheckCircle2, Loader2, X, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleTheme } from "../../ScheduleTheme";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo lightbox state
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [photoRotations, setPhotoRotations] = useState<Record<string, number>>({});

  const photos = useMemo(() => record?.photoUrls ?? [], [record]);
  const isDelivered = record?.status === "delivered";

  // Load saved rotations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("photoRotations");
    if (saved) {
      setPhotoRotations(JSON.parse(saved));
    }
  }, []);

  const saveRotation = (photoUrl: string, rotation: number) => {
    const newRotations = { ...photoRotations, [photoUrl]: rotation };
    setPhotoRotations(newRotations);
    localStorage.setItem("photoRotations", JSON.stringify(newRotations));
  };

  const handleRotateLeft = () => {
    const currentPhoto = photos[lightboxIndex];
    const currentRotation = photoRotations[currentPhoto] || 0;
    const newRotation = (currentRotation - 90 + 360) % 360;
    saveRotation(currentPhoto, newRotation);
  };

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

  const handleMarkDelivered = async () => {
    const confirmed = confirm("Mark this load as delivered?");
    if (!confirmed) return;
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

  return (
    <div className="min-h-screen schedule-theme app-background">
      <ScheduleTheme />
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Back Button */}
        <Link
          href="/schedule"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 py-2 -ml-2"
        >
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
              <p className="text-gray-500 mt-1">Load #{record.loadNumber} · {record.tonnage} tons</p>
            </div>

            {/* Status Card */}
            <div
              className={`rounded-xl p-6 text-center ${
                isDelivered
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                {isDelivered && <CheckCircle2 className="h-6 w-6" />}
                <span className="text-xl font-bold">
                  {isDelivered ? "Delivered" : "Pending Delivery"}
                </span>
              </div>
              {isDelivered && record.deliveredAt && (
                <p className="text-sm opacity-90">
                  {new Date(record.deliveredAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Photo Documentation */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Documentation</h2>
                <span className="text-sm text-gray-500">{photos.length} photo{photos.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Photo Grid */}
              {photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {photos.map((url, idx) => (
                    <button
                      key={url}
                      onClick={() => {
                        setLightboxIndex(idx);
                        setShowLightbox(true);
                      }}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-400 transition-colors"
                    >
                      <Image
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover"
                        style={{
                          transform: `rotate(${photoRotations[url] || 0}deg)`,
                        }}
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 mb-4">
                  <Camera className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No photos yet</p>
                </div>
              )}

              {/* Add Photo Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
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
          </>
        )}
      </div>

      {/* Full-screen Photo Lightbox */}
      {showLightbox && photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
            {photos.length > 1 ? (
              <div className="px-3 py-1 rounded-full bg-black/50 text-white text-sm font-medium">
                {lightboxIndex + 1} / {photos.length}
              </div>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRotateLeft();
                }}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <RotateCcw className="h-6 w-6" />
              </button>
              <button
                onClick={() => setShowLightbox(false)}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Nav buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
                }}
                className="absolute left-2 z-10 p-2 rounded-full bg-black/50 text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-2 z-10 p-2 rounded-full bg-black/50 text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Photo */}
          <div
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full h-full transition-transform duration-300"
              style={{
                transform: `rotate(${photoRotations[photos[lightboxIndex]] || 0}deg)`,
              }}
            >
              <Image
                src={photos[lightboxIndex]}
                alt={`Photo ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
