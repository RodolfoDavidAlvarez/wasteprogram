"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, CheckCircle2, Image as ImageIcon, Loader2, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-mono">VR {vrNumber}</h1>
          <p className="text-sm text-gray-500">Delivery documentation preview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/schedule/records" className="text-sm font-semibold text-emerald-700 hover:underline">
            All records
          </Link>
          <Link href="/schedule" className="text-sm font-semibold text-gray-700 hover:underline">
            Schedule
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : !record ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No record found</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            This VR does not have a delivery record yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isDelivered ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="h-5 w-5" />
                    Delivered
                  </div>
                  {record.deliveredAt && (
                    <div className="text-xs text-emerald-700 mt-1">
                      {new Date(record.deliveredAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold">
                    <Truck className="h-5 w-5" />
                    Scheduled
                  </div>
                  <div className="text-xs text-amber-800 mt-1">Not marked delivered yet</div>
                </div>
              )}

              <div className="text-sm text-gray-700">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Load #</span>
                  <span className="font-semibold">{record.loadNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Scheduled</span>
                  <span className="font-semibold">{new Date(record.scheduledDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Tonnage</span>
                  <span className="font-semibold">{record.tonnage} tons</span>
                </div>
              </div>

              {!isDelivered && (
                <Button onClick={handleMarkDelivered} disabled={marking} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {marking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Marking…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Delivered
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">Documentation Photos ({photos.length})</CardTitle>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                  Take / Upload Photo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {photos.length === 0 ? (
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-gray-400" /> No photos yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {photos.map((url, idx) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="group">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 group-hover:border-emerald-400 transition-colors">
                        <Image src={url} alt={`Delivery photo ${idx + 1}`} fill className="object-cover" unoptimized />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Photo {idx + 1}</div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

