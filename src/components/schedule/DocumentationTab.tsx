"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhotoLightbox } from "@/components/ui/photo-lightbox";
import { usePinProtection } from "@/components/ui/pin-dialog";

type RecordRow = {
  vrNumber: string;
  status: string;
  scheduledDate: string;
  photoUrls: string[];
  tonnage: number;
};

export function DocumentationTab() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedVr, setSelectedVr] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxVr, setLightboxVr] = useState<string>("");
  const [deleting, setDeleting] = useState(false);

  // PIN protection
  const { requestPin, PinDialogComponent } = usePinProtection();

  const refresh = async () => {
    const res = await fetch("/api/schedule/delivery-records");
    const data = await res.json();
    setRecords(data.records ?? []);
  };

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    return [...records].sort((a, b) => (a.scheduledDate < b.scheduledDate ? 1 : -1));
  }, [records]);

  const allVrOptions = useMemo(() => sorted.map((r) => r.vrNumber), [sorted]);

  const onSubmitDocs = async (files: FileList) => {
    if (!selectedVr) return;
    setUploading(true);
    try {
      // Ensure record exists
      await fetch(`/api/schedule/delivery-record/${encodeURIComponent(selectedVr)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vrNumber: selectedVr, scheduledDate: new Date().toISOString(), tonnage: 20 }),
      });

      // Upload each photo
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("vrNumber", selectedVr);
        const res = await fetch("/api/schedule/upload-photo", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Upload failed");
      }

      await refresh();
      setOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to attach documentation. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openLightbox = (vrNumber: string, photos: string[], index: number) => {
    setLightboxVr(vrNumber);
    setLightboxPhotos(photos);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const doDeletePhoto = async (photoUrl: string) => {
    if (!lightboxVr) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/schedule/delete-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vrNumber: lightboxVr, photoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete photo");

      // Update lightbox photos
      const newPhotos = lightboxPhotos.filter((p) => p !== photoUrl);
      if (newPhotos.length === 0) {
        setLightboxOpen(false);
      } else {
        setLightboxPhotos(newPhotos);
        if (lightboxIndex >= newPhotos.length) {
          setLightboxIndex(newPhotos.length - 1);
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

  return (
    <div className="space-y-4">
      {PinDialogComponent}

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">All documentation (by VR)</div>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Documentation
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Attach documentation</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">VR Number</label>
            <select
              value={selectedVr}
              onChange={(e) => setSelectedVr(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select a VR…</option>
              {allVrOptions.map((vr) => (
                <option key={vr} value={vr}>
                  VR {vr}
                </option>
              ))}
            </select>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onSubmitDocs(e.target.files);
                }
              }}
            />

            <Button
              variant="outline"
              className="w-full h-20 border-2 border-dashed border-emerald-300 hover:border-emerald-500"
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedVr || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5 mr-2" /> Take photo / choose files
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500">
              Tip: pick a VR, then use the button to open the camera (mobile) or file picker (desktop).
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Records</CardTitle>
          <Link href="/schedule/records" className="text-xs font-semibold text-emerald-700 hover:underline">
            Open full list
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-sm text-gray-500">No documentation yet.</div>
          ) : (
            <div className="space-y-6">
              {sorted.map((r) => (
                <div key={r.vrNumber} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/schedule/records/${encodeURIComponent(r.vrNumber)}`}
                        className="font-mono font-bold text-gray-900 hover:underline"
                      >
                        VR {r.vrNumber}
                      </Link>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {(r.tonnage * 2000).toLocaleString()} lbs ({r.tonnage.toFixed(2)} tons)
                      </p>
                    </div>
                    <div className="text-xs text-gray-600 text-right">
                      {r.photoUrls.length} photos<br />
                      <span className={r.status === "delivered" ? "text-emerald-600" : "text-amber-600"}>
                        {r.status}
                      </span>
                    </div>
                  </div>

                  {r.photoUrls.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {r.photoUrls.slice(0, 4).map((url, idx) => (
                        <div key={url} className="relative group">
                          <button
                            onClick={() => openLightbox(r.vrNumber, r.photoUrls, idx)}
                            className="relative aspect-[4/3] rounded-md overflow-hidden border border-gray-200 hover:border-emerald-400 transition-colors w-full"
                          >
                            <Image src={url} alt={`VR ${r.vrNumber} photo`} fill className="object-cover" unoptimized />
                          </button>
                          {/* Delete button on hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxVr(r.vrNumber);
                              setLightboxPhotos(r.photoUrls);
                              handleDeletePhoto(url);
                            }}
                            className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {r.photoUrls.length > 4 && (
                        <button
                          onClick={() => openLightbox(r.vrNumber, r.photoUrls, 4)}
                          className="relative aspect-[4/3] rounded-md overflow-hidden border border-gray-200 bg-gray-100 hover:border-emerald-400 transition-colors flex items-center justify-center"
                        >
                          <span className="text-sm font-semibold text-gray-600">+{r.photoUrls.length - 4} more</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 py-3 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <Camera className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">No photos yet</span>
                      <Link
                        href={`/schedule/records/${encodeURIComponent(r.vrNumber)}`}
                        className="text-xs text-emerald-600 hover:underline ml-auto"
                      >
                        Add photos
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Lightbox */}
      <PhotoLightbox
        photos={lightboxPhotos}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onDelete={handleDeletePhoto}
        deleting={deleting}
      />
    </div>
  );
}
