import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DeliveryRecordsIndexPage() {
  const records = await prisma.deliveryRecord.findMany({
    orderBy: [{ scheduledDate: "desc" }],
    take: 200,
  });

  const parsed = records.map((r) => ({
    ...r,
    photoCount: r.photoUrls ? (JSON.parse(r.photoUrls) as string[]).length : 0,
  }));

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
          {parsed.length === 0 ? (
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

