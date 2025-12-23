"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Scale,
  Calendar,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  Camera,
  FileText,
  MapPin,
  Hash,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  AlertCircle
} from "lucide-react";

type DeliveryRecord = {
  id: string;
  vrNumber: string;
  status: string;
  loadNumber: number;
  scheduledDate: string;
  deliveredAt: string | null;
  deliveredBy: string | null;
  tonnage: number;
  notes: string | null;
  photoUrls: string[];
};

type ParsedNotes = {
  netWeightLbs?: number;
  trailerNumber?: string;
  sealNumber?: string;
  materialType?: string;
  source?: string;
  bolNumber?: string;
  poNumber?: string;
  origin?: string;
  shipper?: string;
  products?: string[];
};

export default function DeliveryDetailPage() {
  const params = useParams();
  const vrNumber = decodeURIComponent(params.vrNumber as string);

  const [record, setRecord] = useState<DeliveryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function fetchRecord() {
      setLoading(true);
      try {
        const res = await fetch(`/api/schedule/delivery-record/${encodeURIComponent(vrNumber)}`);
        const data = await res.json();
        setRecord(data.record || null);
      } catch (error) {
        console.error("Error fetching record:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [vrNumber]);

  const parseNotes = (notesStr: string | null): ParsedNotes => {
    if (!notesStr) return {};
    try {
      return JSON.parse(notesStr);
    } catch {
      return {};
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatWeight = (tons: number) => {
    const lbs = tons * 2000;
    return {
      lbs: lbs.toLocaleString(),
      tons: tons.toFixed(2)
    };
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    if (record?.photoUrls) {
      setLightboxIndex((prev) => (prev + 1) % record.photoUrls.length);
    }
  };

  const prevImage = () => {
    if (record?.photoUrls) {
      setLightboxIndex((prev) => (prev - 1 + record.photoUrls.length) % record.photoUrls.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Loading..." subtitle="" />
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Not Found" subtitle="" />
        <div className="p-6 text-center">
          <p className="text-gray-500">Delivery record not found for VR {vrNumber}</p>
          <Link href="/deliveries">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deliveries
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const notes = parseNotes(record.notes);
  const weight = formatWeight(record.tonnage);
  const hasPhotos = record.photoUrls && record.photoUrls.length > 0;
  const isDelivered = record.status === "delivered";
  const isBOL = vrNumber.startsWith("BOL-");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={`VR ${vrNumber}`}
        subtitle={record.loadNumber ? `Load #${record.loadNumber}` : "Delivery Record"}
      />

      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/deliveries"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Deliveries</span>
        </Link>

        {/* Status Banner */}
        <div className={`rounded-xl p-4 ${
          isDelivered
            ? hasPhotos
              ? "bg-emerald-500 text-white"
              : "bg-amber-500 text-white"
            : "bg-blue-500 text-white"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDelivered ? (
                hasPhotos ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <AlertCircle className="h-6 w-6" />
                )
              ) : (
                <Clock className="h-6 w-6" />
              )}
              <div>
                <p className="font-bold text-lg">
                  {isDelivered ? (hasPhotos ? "Delivered & Documented" : "Delivered - Missing Documentation") : "Scheduled"}
                </p>
                <p className="text-sm opacity-90">
                  {formatDate(record.scheduledDate)}
                </p>
              </div>
            </div>
            {record.loadNumber > 0 && (
              <div className="text-right">
                <p className="text-sm opacity-75">Load Number</p>
                <p className="text-2xl font-bold">#{record.loadNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Weight Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-5 w-5 text-emerald-600" />
              Weight Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Net Weight</p>
                <p className="text-3xl font-bold text-gray-900">{weight.lbs}</p>
                <p className="text-sm text-gray-500">pounds</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <p className="text-sm text-emerald-600 mb-1">Tonnage</p>
                <p className="text-3xl font-bold text-emerald-700">{weight.tons}</p>
                <p className="text-sm text-emerald-600">tons</p>
              </div>
            </div>
            {notes.netWeightLbs && (
              <p className="text-xs text-gray-400 text-center mt-3">
                Verified from MLT Form: {notes.netWeightLbs.toLocaleString()} lbs
              </p>
            )}
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.trailerNumber && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Trailer Number</p>
                    <p className="font-mono font-semibold">{notes.trailerNumber}</p>
                  </div>
                </div>
              )}
              {notes.sealNumber && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Seal Number</p>
                    <p className="font-mono font-semibold">{notes.sealNumber}</p>
                  </div>
                </div>
              )}
              {notes.materialType && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Material Type</p>
                    <p className="font-semibold">{notes.materialType}</p>
                  </div>
                </div>
              )}
              {notes.source && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Source Document</p>
                    <p className="font-semibold">{notes.source}</p>
                  </div>
                </div>
              )}
              {notes.origin && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Origin</p>
                    <p className="font-semibold text-sm">{notes.origin}</p>
                  </div>
                </div>
              )}
              {notes.poNumber && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">PO Number</p>
                    <p className="font-mono font-semibold">{notes.poNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documentation Photos */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-600" />
                Documentation Photos
              </CardTitle>
              {hasPhotos && (
                <span className="text-sm text-gray-500">
                  {record.photoUrls.length} photo{record.photoUrls.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {hasPhotos ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {record.photoUrls.map((url, idx) => (
                  <button
                    key={url}
                    onClick={() => openLightbox(idx)}
                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-emerald-400 transition-all group"
                  >
                    <Image
                      src={url}
                      alt={`Documentation photo ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {idx + 1} / {record.photoUrls.length}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Camera className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No documentation photos</p>
                <p className="text-sm text-gray-400 mt-1">
                  Photos can be uploaded from the field team schedule
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BOL Specific Info */}
        {isBOL && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                <Truck className="h-5 w-5" />
                Outbound Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700">
                This is an outbound delivery from Congress, AZ to an external destination.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && hasPhotos && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-8 w-8" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <div className="relative w-full h-full max-w-5xl max-h-[80vh] mx-16">
            <Image
              src={record.photoUrls[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          <button
            onClick={nextImage}
            className="absolute right-4 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
            {lightboxIndex + 1} / {record.photoUrls.length}
          </div>
        </div>
      )}
    </div>
  );
}
