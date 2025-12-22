"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type RecordRow = {
  vrNumber: string;
  status: string;
  scheduledDate: string;
  photoUrls: string[];
};

export default function DeliveryRecordsIndexClient() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/schedule/delivery-records")
      .then((r) => r.json())
      .then((d) => setRecords(d.records ?? []))
      .finally(() => setLoading(false));
  }, []);

  const parsed = useMemo(
    () =>
      records.map((r) => ({
        ...r,
        photoCount: r.photoUrls?.length ?? 0,
      })),
    [records]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Records</h1>
          <p className="text-sm text-gray-500">Preview documentation photos by VR number.</p>
        </div>
        <Link href="/schedule" className="text-sm font-semibold text-emerald-700 hover:underline">
          Back to Schedule
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : parsed.length === 0 ? (
            <div className="text-sm text-gray-500">No delivery records yet.</div>
          ) : (
            <div className="divide-y">
              {parsed.map((r) => (
                <Link
                  key={r.vrNumber}
                  href={`/schedule/records/${encodeURIComponent(r.vrNumber)}`}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded"
                >
                  <div className="min-w-0">
                    <div className="font-mono font-bold text-gray-900">VR {r.vrNumber}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(r.scheduledDate).toLocaleDateString()} · Status: {r.status}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-700">{r.photoCount} photos</div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




