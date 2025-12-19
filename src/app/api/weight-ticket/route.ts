import { NextResponse } from "next/server";

type TicketPayload = {
  ticketNumber?: string;
  date?: string;
  timeIn?: string;
  timeOut?: string;
  carrierCompany?: string;
  driverName?: string;
  truckNumber?: string;
  trailerNumber?: string;
  referenceNumber?: string;
  materialType?: string;
  origin?: string;
  destination?: string;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;
  notes?: string;
};

function formatLbs(weight?: number) {
  if (weight === undefined || Number.isNaN(weight)) return "—";
  return `${new Intl.NumberFormat("en-US").format(Math.round(weight))} lbs`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TicketPayload;

    const gross = Number(body.grossWeight);
    const tare = Number(body.tareWeight);
    const net = Number.isFinite(gross) && Number.isFinite(tare) ? gross - tare : undefined;

    if (!Number.isFinite(gross) || !Number.isFinite(tare)) {
      return NextResponse.json(
        { error: "Please provide numeric grossWeight and tareWeight (lbs)." },
        { status: 400 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || "Soil Seed & Water <ralvarez@soilseedandwater.com>";
    const toEmail = "ralvarez@soilseedandwater.com";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Email service is not configured (missing RESEND_API_KEY)." },
        { status: 500 },
      );
    }

    const subject = `Weigh Ticket ${body.ticketNumber || ""}`.trim();

    const textLines = [
      `Ticket: ${body.ticketNumber ?? "N/A"}`,
      `Date: ${body.date ?? "N/A"}`,
      `Time In: ${body.timeIn ?? "N/A"}`,
      `Time Out: ${body.timeOut ?? "N/A"}`,
      `Carrier/Company: ${body.carrierCompany ?? "N/A"}`,
      `Driver: ${body.driverName ?? "N/A"}`,
      `Truck #: ${body.truckNumber ?? "N/A"}`,
      `Trailer #: ${body.trailerNumber ?? "N/A"}`,
      `Reference/BOL: ${body.referenceNumber ?? "N/A"}`,
      `Material: ${body.materialType ?? "N/A"}`,
      `Origin: ${body.origin ?? "N/A"}`,
      `Destination: ${body.destination ?? "N/A"}`,
      `Gross: ${formatLbs(gross)}`,
      `Tare: ${formatLbs(tare)}`,
      `Net: ${formatLbs(net)}`,
      `Notes: ${body.notes ?? "—"}`,
    ];

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#111827">
        <h2 style="margin:0 0 12px;font-size:18px;color:#065f46">New Weigh Ticket Submitted</h2>
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tbody>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Ticket #</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${body.ticketNumber ?? "N/A"}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Date</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${body.date ?? "N/A"}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Time In / Out</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${body.timeIn || "—"} / ${body.timeOut || "—"}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Carrier / Driver</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${body.carrierCompany || "N/A"} / ${body.driverName || "N/A"}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Truck / Trailer</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${body.truckNumber || "N/A"} / ${body.trailerNumber || "N/A"}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Reference / BOL</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${body.referenceNumber || "N/A"}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Material</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${body.materialType || "N/A"}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Origin / Destination</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${body.origin || "N/A"} / ${body.destination || "N/A"}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Gross</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${formatLbs(gross)}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Tare</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${formatLbs(tare)}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#065f46">Net</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb;color:#065f46;font-weight:700">${formatLbs(net)}</td></tr>
          </tbody>
        </table>
        <div style="margin-top:12px;padding:10px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb">
          <div style="font-weight:600;color:#374151;margin-bottom:6px">Notes</div>
          <div style="color:#4b5563">${body.notes ? body.notes.replace(/\n/g, "<br/>") : "—"}</div>
        </div>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: subject || "Weigh Ticket Submitted",
        html,
        text: textLines.join("\n"),
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend error:", errorText);
      return NextResponse.json(
        { error: "Failed to send email", detail: errorText },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Weight ticket API error:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
