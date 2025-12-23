import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Plus, Handshake, Building2, User, TrendingUp, TrendingDown, Calendar, Truck, FileText, Download, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getDeals() {
  try {
    const { data: deals, error } = await supabase
      .from('wd_deals')
      .select(`
        *,
        client:wd_clients!clientId (
          id,
          companyName,
          accountNumber
        ),
        contact:wd_contacts!contactId (
          id,
          firstName,
          lastName,
          email,
          phone,
          title
        )
      `)
      .order('lastActivityAt', { ascending: false });

    if (error) {
      console.error("Supabase error fetching deals:", error);
      return [];
    }

    return deals || [];
  } catch (error) {
    console.error("Database connection error:", error);
    return [];
  }
}

// Get invoice summary from delivery records
async function getInvoiceSummary() {
  const VANGUARD_RATE = 45;
  const OUTBOUND_RATE = 20;

  try {
    const { data: records, error } = await supabase
      .from('wd_delivery_records')
      .select('vrNumber, loadNumber, scheduledDate, tonnage, status')
      .order('scheduledDate', { ascending: true });

    if (error) {
      console.error("Error fetching delivery records:", error);
      return { vanguard: null, threelag: null };
    }

    // Separate Vanguard and outbound loads
    const vanguardRecords = (records || []).filter(r => !r.vrNumber.startsWith('BOL-'));
    const outboundRecords = (records || []).filter(r => r.vrNumber.startsWith('BOL-'));

    const vanguardTons = vanguardRecords.reduce((s, r) => s + (r.tonnage || 0), 0);
    const outboundTons = outboundRecords.reduce((s, r) => s + (r.tonnage || 0), 0);

    return {
      vanguard: {
        loads: vanguardRecords.length,
        tons: vanguardTons,
        rate: VANGUARD_RATE,
        amount: vanguardTons * VANGUARD_RATE,
        client: 'Vanguard Renewables',
        contact: 'Casey Tucker',
        invoiceNumber: 'INV-VNG-20251223-001'
      },
      threelag: {
        loads: outboundRecords.length,
        tons: outboundTons,
        rate: OUTBOUND_RATE,
        amount: outboundTons * OUTBOUND_RATE,
        client: '3LAG / Jack Mendoza',
        contact: 'Jack Mendoza',
        invoiceNumber: 'INV-3LAG-20251223-001'
      }
    };
  } catch (error) {
    console.error("Error:", error);
    return { vanguard: null, threelag: null };
  }
}

function getStageColor(stage: string) {
  switch (stage) {
    case "lead":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "negotiation":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "completed":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    case "on_hold":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

function getRateTypeIcon(rateType: string) {
  if (rateType === "purchase") {
    return <TrendingDown className="h-4 w-4 text-orange-500" title="We pay them" />;
  }
  return <TrendingUp className="h-4 w-4 text-green-500" title="They pay us" />;
}

export default async function DealsPage() {
  const [deals, invoices] = await Promise.all([getDeals(), getInvoiceSummary()]);

  // Calculate summary stats
  const activeDeals = deals.filter(d => d.stage === "active");
  const totalEstimatedValue = activeDeals.reduce((sum, d) => sum + (d.estimatedValue || 0), 0);
  const totalActualRevenue = deals.reduce((sum, d) => sum + (d.actualRevenue || 0), 0);
  const totalTonnage = deals.reduce((sum, d) => sum + (d.actualTonnage || 0), 0);

  // Invoice totals
  const invoiceTotal = (invoices.vanguard?.amount || 0) + (invoices.threelag?.amount || 0);

  return (
    <div>
      <Header title="Deals" subtitle="Track waste diversion opportunities and active projects" />
      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Active Deals</div>
              <div className="text-2xl font-bold text-foreground">{activeDeals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Est. Pipeline Value</div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalEstimatedValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Actual Revenue</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalActualRevenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Tonnage</div>
              <div className="text-2xl font-bold text-foreground">{totalTonnage.toFixed(1)} tons</div>
            </CardContent>
          </Card>
        </div>

        {/* December 2025 Invoices */}
        {(invoices.vanguard || invoices.threelag) && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">December 2025 Invoices</h2>
              <span className="ml-auto text-sm text-muted-foreground">
                Total: <span className="font-bold text-green-600">{formatCurrency(invoiceTotal)}</span>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vanguard Invoice */}
              {invoices.vanguard && (
                <Card className="border-l-4 border-l-emerald-500">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{invoices.vanguard.client}</h3>
                        <p className="text-sm text-muted-foreground">{invoices.vanguard.contact}</p>
                      </div>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Incoming
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-3">
                      <div>
                        <p className="text-lg font-semibold">{invoices.vanguard.loads}</p>
                        <p className="text-xs text-muted-foreground">Loads</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{invoices.vanguard.tons.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Tons</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-emerald-600">{formatCurrency(invoices.vanguard.amount)}</p>
                        <p className="text-xs text-muted-foreground">@ ${invoices.vanguard.rate}/ton</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{invoices.vanguard.invoiceNumber}</code>
                      <Link href="/deliveries" className="text-primary hover:underline text-sm flex items-center gap-1">
                        <Truck className="h-3 w-3" /> View Loads
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 3LAG Invoice */}
              {invoices.threelag && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{invoices.threelag.client}</h3>
                        <p className="text-sm text-muted-foreground">{invoices.threelag.contact}</p>
                      </div>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Outbound
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-3">
                      <div>
                        <p className="text-lg font-semibold">{invoices.threelag.loads}</p>
                        <p className="text-xs text-muted-foreground">Loads</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{invoices.threelag.tons.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Tons</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-blue-600">{formatCurrency(invoices.threelag.amount)}</p>
                        <p className="text-xs text-muted-foreground">@ ${invoices.threelag.rate}/ton</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{invoices.threelag.invoiceNumber}</code>
                      <Link href="/deliveries" className="text-primary hover:underline text-sm flex items-center gap-1">
                        <Truck className="h-3 w-3" /> View Loads
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground">{deals.length} total deals</div>
          <Link href="/admin/deals/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Deal
            </Button>
          </Link>
        </div>

        {/* Deals Grid */}
        {deals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Handshake className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No deals yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Get started by creating your first deal to track waste diversion opportunities.</p>
              <Link href="/admin/deals/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Deal
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <Link key={deal.id} href={`/admin/deals/${deal.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{deal.dealName}</h3>
                        <p className="text-sm font-mono text-muted-foreground">{deal.dealNumber}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ml-2 ${getStageColor(deal.stage)}`}>
                        {deal.stage.replace("_", " ")}
                      </span>
                    </div>

                    {/* Client & Contact */}
                    <div className="space-y-2 text-sm mb-4">
                      {deal.client && (
                        <div className="flex items-center text-foreground">
                          <Building2 className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{deal.client.companyName}</span>
                        </div>
                      )}
                      {deal.contact && (
                        <div className="flex items-center text-foreground">
                          <User className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{deal.contact.firstName} {deal.contact.lastName}</span>
                        </div>
                      )}
                    </div>

                    {/* Material & Rate */}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-muted-foreground capitalize">{deal.materialType.replace("_", " ")}</span>
                      <div className="flex items-center gap-1">
                        {getRateTypeIcon(deal.rateType)}
                        <span className="font-semibold text-foreground">{formatCurrency(deal.ratePerTon)}/ton</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="pt-4 border-t border-border">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-semibold text-foreground">
                            {deal.completedLoads}/{deal.totalLoads || "?"}
                          </p>
                          <p className="text-xs text-muted-foreground">Loads</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">
                            {(deal.actualTonnage || 0).toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">Tons</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-primary">
                            {formatCurrency(deal.actualRevenue || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
