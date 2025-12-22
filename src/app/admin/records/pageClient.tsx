"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Camera, Calendar, Truck } from "lucide-react";

type RecordRow = {
  vrNumber: string;
  status: string;
  scheduledDate: string;
  photoUrls: string[];
};

export default function DeliveryRecordsIndexClient() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/schedule/delivery-records")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch records");
        return r.json();
      })
      .then((d) => setRecords(d.records ?? []))
      .catch((err) => setError(err.message))
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

  const totalPhotos = parsed.reduce((sum, r) => sum + r.photoCount, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Truck className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
            <p className="text-2xl font-bold">{records.length}</p>
            <p className="text-xs text-gray-500">Total Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Camera className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold">{totalPhotos}</p>
            <p className="text-xs text-gray-500">Total Photos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold">
              {records.filter((r) => r.status === "delivered").length}
            </p>
            <p className="text-xs text-gray-500">Delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading records...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <p>{error}</p>
              <p className="text-sm text-gray-500 mt-2">Please try refreshing the page.</p>
            </div>
          ) : parsed.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No delivery records yet.</p>
              <p className="text-sm mt-1">Records will appear here once deliveries are made.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VR Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Photos
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsed.map((r) => (
                    <tr key={r.vrNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-emerald-600">VR {r.vrNumber}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(r.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            r.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : r.status === "in_transit"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {r.photoCount} photos
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link
                          href={`/schedule/records/${encodeURIComponent(r.vrNumber)}`}
                          className="text-emerald-600 hover:text-emerald-900 font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
