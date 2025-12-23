import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  Truck,
  FileText,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getDeal(id: string) {
  try {
    const { data: deal, error } = await supabase
      .from('wd_deals')
      .select(`
        *,
        client:wd_clients!clientId (*),
        contact:wd_contacts!contactId (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error("Supabase error fetching deal:", error);
      return null;
    }

    return deal;
  } catch (error) {
    console.error("Error fetching deal:", error);
    return null;
  }
}

function getStageColor(stage: string) {
  switch (stage) {
    case "lead":
      return "bg-blue-100 text-blue-800";
    case "negotiation":
      return "bg-yellow-100 text-yellow-800";
    case "active":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    case "on_hold":
      return "bg-orange-100 text-orange-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const deal = await getDeal(params.id);

  if (!deal) {
    notFound();
  }

  const progressPercent = deal.totalLoads
    ? Math.round((deal.completedLoads / deal.totalLoads) * 100)
    : 0;

  return (
    <div>
      <Header
        title={deal.dealName}
        subtitle={`Deal ${deal.dealNumber}`}
      />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Link href="/admin/deals" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Deals
          </Link>
          <Link href={`/admin/deals/${deal.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Deal
            </Button>
          </Link>
        </div>

        {/* Status Banner */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getStageColor(deal.stage)}`}>
                  {deal.stage.replace("_", " ").toUpperCase()}
                </span>
                <div className="flex items-center gap-1">
                  {deal.rateType === "purchase" ? (
                    <TrendingDown className="h-5 w-5 text-orange-500" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  )}
                  <span className="text-lg font-bold">{formatCurrency(deal.ratePerTon)}/ton</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    ({deal.rateType === "purchase" ? "We pay them" : "They pay us"})
                  </span>
                </div>
              </div>
              {deal.totalLoads && (
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Progress</div>
                  <div className="text-lg font-bold">{deal.completedLoads} / {deal.totalLoads} loads ({progressPercent}%)</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <div className="text-2xl font-bold">{(deal.actualTonnage || 0).toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Actual Tons</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Truck className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <div className="text-2xl font-bold">{deal.completedLoads}</div>
                  <div className="text-xs text-muted-foreground">Completed Loads</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(deal.actualRevenue || 0)}</div>
                  <div className="text-xs text-muted-foreground">Actual Revenue</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
                  <div className="text-2xl font-bold text-primary">{formatCurrency(deal.estimatedValue || 0)}</div>
                  <div className="text-xs text-muted-foreground">Est. Value</div>
                </CardContent>
              </Card>
            </div>

            {/* Material Details */}
            <Card>
              <CardHeader>
                <CardTitle>Material Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">Material Type</dt>
                    <dd className="font-medium capitalize">{deal.materialType.replace("_", " ")}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Est. Tonnage</dt>
                    <dd className="font-medium">{deal.estimatedTonnage?.toFixed(2) || "—"} tons</dd>
                  </div>
                  {deal.materialDescription && (
                    <div className="col-span-2">
                      <dt className="text-sm text-muted-foreground">Description</dt>
                      <dd className="font-medium">{deal.materialDescription}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* Logistics */}
            <Card>
              <CardHeader>
                <CardTitle>Logistics</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">Delivery Method</dt>
                    <dd className="font-medium capitalize">{deal.deliveryMethod?.replace("_", " ") || "—"}</dd>
                  </div>
                  {deal.pickupLocation && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Pickup Location</dt>
                      <dd className="font-medium">{deal.pickupLocation}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-muted-foreground">Start Date</dt>
                    <dd className="font-medium">
                      {deal.startDate ? new Date(deal.startDate).toLocaleDateString() : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">End Date</dt>
                    <dd className="font-medium">
                      {deal.endDate ? new Date(deal.endDate).toLocaleDateString() : "—"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* References */}
            {(deal.poNumber || deal.vrNumbers || deal.contractRef) && (
              <Card>
                <CardHeader>
                  <CardTitle>References</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-4">
                    {deal.poNumber && (
                      <div>
                        <dt className="text-sm text-muted-foreground">PO Number</dt>
                        <dd className="font-mono font-medium">{deal.poNumber}</dd>
                      </div>
                    )}
                    {deal.vrNumbers && (
                      <div>
                        <dt className="text-sm text-muted-foreground">VR Numbers</dt>
                        <dd className="font-mono font-medium">{deal.vrNumbers}</dd>
                      </div>
                    )}
                    {deal.contractRef && (
                      <div>
                        <dt className="text-sm text-muted-foreground">Contract Reference</dt>
                        <dd className="font-medium">{deal.contractRef}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {deal.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{deal.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client */}
            {deal.client && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/admin/clients/${deal.client.id}`} className="hover:underline">
                    <h3 className="font-semibold text-primary">{deal.client.companyName}</h3>
                  </Link>
                  <p className="text-sm font-mono text-muted-foreground">{deal.client.accountNumber}</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      {deal.client.operationalEmail}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {deal.client.operationalPhone}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact */}
            {deal.contact && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Primary Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold">{deal.contact.firstName} {deal.contact.lastName}</h3>
                  {deal.contact.title && (
                    <p className="text-sm text-muted-foreground">{deal.contact.title}</p>
                  )}
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`mailto:${deal.contact.email}`} className="hover:underline text-primary">
                        {deal.contact.email}
                      </a>
                    </div>
                    {deal.contact.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a href={`tel:${deal.contact.phone}`} className="hover:underline">
                          {deal.contact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium">{new Date(deal.createdAt).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last Activity</dt>
                    <dd className="font-medium">{new Date(deal.lastActivityAt).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last Updated</dt>
                    <dd className="font-medium">{new Date(deal.updatedAt).toLocaleString()}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
