"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Truck,
  Package,
  Scale,
  Camera,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  DollarSign,
} from "lucide-react";

// Pricing constants
const VANGUARD_RATE_PER_TON = 45;
const OUTBOUND_RATE_PER_TON = 20;

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

type DealInfo = {
  id: string;
  dealName: string;
  clientName: string;
  materialType: string;
};

export default function DeliveriesPage() {
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [deals, setDeals] = useState<DealInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch delivery records
        const recordsRes = await fetch("/api/schedule/delivery-records");
        const recordsData = await recordsRes.json();
        setRecords(recordsData.records || []);

        // Fetch deals for context
        const dealsRes = await fetch("/api/deals");
        const dealsData = await dealsRes.json();
        setDeals(dealsData.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const delivered = records.filter(r => r.status === "delivered");
    const scheduled = records.filter(r => r.status === "scheduled");
    const withPhotos = records.filter(r => r.photoUrls && r.photoUrls.length > 0);
    const totalTonnage = records.reduce((sum, r) => sum + (r.tonnage || 0), 0);
    const documentedTonnage = delivered
      .filter(r => r.photoUrls && r.photoUrls.length > 0)
      .reduce((sum, r) => sum + (r.tonnage || 0), 0);

    // Calculate revenue by source
    const vanguardTons = records
      .filter(r => !r.vrNumber.startsWith("BOL-") && !r.vrNumber.startsWith("PENDING-") && !r.vrNumber.startsWith("TYSON-"))
      .reduce((sum, r) => sum + (r.tonnage || 0), 0);
    const outboundTons = records
      .filter(r => r.vrNumber.startsWith("BOL-"))
      .reduce((sum, r) => sum + (r.tonnage || 0), 0);

    const vanguardRevenue = vanguardTons * VANGUARD_RATE_PER_TON;
    const outboundRevenue = outboundTons * OUTBOUND_RATE_PER_TON;
    const totalRevenue = vanguardRevenue + outboundRevenue;

    return {
      total: records.length,
      delivered: delivered.length,
      scheduled: scheduled.length,
      withPhotos: withPhotos.length,
      totalTonnage,
      documentedTonnage,
      vanguardTons,
      outboundTons,
      vanguardRevenue,
      outboundRevenue,
      totalRevenue,
    };
  }, [records]);

  // Sort records by date descending, then by load number
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const dateA = new Date(a.scheduledDate).getTime();
      const dateB = new Date(b.scheduledDate).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return (b.loadNumber || 0) - (a.loadNumber || 0);
    });
  }, [records]);

  // Group records by source/deal
  const groupedRecords = useMemo(() => {
    const vanguardRecords = sortedRecords.filter(r =>
      !r.vrNumber.startsWith("BOL-") &&
      !r.vrNumber.startsWith("PENDING-") &&
      !r.vrNumber.startsWith("TYSON-")
    );
    const outboundRecords = sortedRecords.filter(r => r.vrNumber.startsWith("BOL-"));
    const pendingRecords = sortedRecords.filter(r => r.vrNumber.startsWith("PENDING-"));
    const otherRecords = sortedRecords.filter(r => r.vrNumber.startsWith("TYSON-"));

    return { vanguardRecords, outboundRecords, pendingRecords, otherRecords };
  }, [sortedRecords]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
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

  const getStatusBadge = (status: string, hasPhotos: boolean) => {
    if (status === "delivered") {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
          hasPhotos
            ? "bg-emerald-100 text-emerald-800"
            : "bg-amber-100 text-amber-800"
        }`}>
          {hasPhotos ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
          {hasPhotos ? "Documented" : "Missing Photo"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
        <Clock className="h-3 w-3" />
        Scheduled
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Deliveries" subtitle="Loading..." />
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Deliveries" subtitle="All waste intake deliveries and documentation" />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-500">Total Loads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
                  <p className="text-xs text-gray-500">Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Camera className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.withPhotos}</p>
                  <p className="text-xs text-gray-500">With Photos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Scale className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTonnage.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Total Tons</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards - Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold opacity-90">Total Revenue</h3>
                  <p className="text-3xl font-bold mt-1">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm opacity-75 mt-1">
                    {stats.totalTonnage.toFixed(2)} tons total
                  </p>
                </div>
                <DollarSign className="h-12 w-12 opacity-30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold opacity-90">Documented Weight</h3>
                  <p className="text-3xl font-bold mt-1">{stats.documentedTonnage.toFixed(2)} tons</p>
                  <p className="text-sm opacity-75 mt-1">
                    {(stats.documentedTonnage * 2000).toLocaleString()} lbs from {stats.withPhotos} documented loads
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 opacity-30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vanguard Dog Food Loads */}
        {groupedRecords.vanguardRecords.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-600" />
                  Vanguard Renewables - Dog Food
                  <span className="text-sm font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    $45/ton
                  </span>
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {groupedRecords.vanguardRecords.length} loads
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Load</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">VR Number</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Weight (lbs)</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Tons</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Photos</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {groupedRecords.vanguardRecords
                      .sort((a, b) => (a.loadNumber || 0) - (b.loadNumber || 0))
                      .map((record) => {
                        const weight = formatWeight(record.tonnage);
                        const hasPhotos = record.photoUrls && record.photoUrls.length > 0;
                        const amount = record.tonnage * VANGUARD_RATE_PER_TON;
                        return (
                          <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-sm">
                                {record.loadNumber || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Link
                                href={`/deliveries/${encodeURIComponent(record.vrNumber)}`}
                                className="font-mono font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                              >
                                {record.vrNumber}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {formatDate(record.scheduledDate)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-sm">
                              {weight.lbs}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-sm font-semibold">
                              {weight.tons}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-emerald-700">
                              ${amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {hasPhotos ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600">
                                  <Camera className="h-4 w-4" />
                                  <span className="text-sm font-medium">{record.photoUrls.length}</span>
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {getStatusBadge(record.status, hasPhotos)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                href={`/deliveries/${encodeURIComponent(record.vrNumber)}`}
                                className="p-2 rounded-lg hover:bg-gray-100 inline-flex"
                              >
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-700">
                        Subtotal ({groupedRecords.vanguardRecords.length} loads) @ $45/ton
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-bold text-gray-900">
                        {(groupedRecords.vanguardRecords.reduce((sum, r) => sum + r.tonnage * 2000, 0)).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-bold text-gray-900">
                        {groupedRecords.vanguardRecords.reduce((sum, r) => sum + r.tonnage, 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-bold text-emerald-700">
                        ${(groupedRecords.vanguardRecords.reduce((sum, r) => sum + r.tonnage, 0) * VANGUARD_RATE_PER_TON).toFixed(2)}
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Outbound BOL Loads */}
        {groupedRecords.outboundRecords.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Outbound Deliveries (3LAG / Jack Mendoza)
                  <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    $20/ton
                  </span>
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {groupedRecords.outboundRecords.length} loads
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">BOL Number</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Weight (lbs)</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Tons</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {groupedRecords.outboundRecords.map((record) => {
                      const weight = formatWeight(record.tonnage);
                      const hasPhotos = record.photoUrls && record.photoUrls.length > 0;
                      const amount = record.tonnage * OUTBOUND_RATE_PER_TON;
                      return (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <Link
                              href={`/deliveries/${encodeURIComponent(record.vrNumber)}`}
                              className="font-mono font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                            >
                              {record.vrNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(record.scheduledDate)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm">
                            {weight.lbs}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-semibold">
                            {weight.tons}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-blue-700">
                            ${amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {getStatusBadge(record.status, hasPhotos)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/deliveries/${encodeURIComponent(record.vrNumber)}`}
                              className="p-2 rounded-lg hover:bg-gray-100 inline-flex"
                            >
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700">
                        Subtotal ({groupedRecords.outboundRecords.length} loads) @ $20/ton
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-bold text-gray-900">
                        {(groupedRecords.outboundRecords.reduce((sum, r) => sum + r.tonnage * 2000, 0)).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-bold text-gray-900">
                        {groupedRecords.outboundRecords.reduce((sum, r) => sum + r.tonnage, 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-bold text-blue-700">
                        ${(groupedRecords.outboundRecords.reduce((sum, r) => sum + r.tonnage, 0) * OUTBOUND_RATE_PER_TON).toFixed(2)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Loads */}
        {groupedRecords.pendingRecords.length > 0 && (
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-500">
                  <Clock className="h-5 w-5" />
                  Pending / Upcoming
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {groupedRecords.pendingRecords.length} loads
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupedRecords.pendingRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-mono text-sm text-gray-600">{record.vrNumber}</span>
                      <span className="text-sm text-gray-400 ml-3">{formatDate(record.scheduledDate)}</span>
                    </div>
                    <span className="text-sm text-gray-500">{record.tonnage} tons (estimated)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
