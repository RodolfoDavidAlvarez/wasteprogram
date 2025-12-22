import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { WeighTicketPDF } from "@/components/weigh-ticket/WeighTicketPDF";

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

function escapeHtml(str?: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeValue(value?: string, fallback = "N/A"): string {
  return escapeHtml(value) || fallback;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TicketPayload;

    const {
      ticketNumber = "",
      date = "",
      timeIn = "",
      timeOut = "",
      carrierCompany = "",
      driverName = "",
      truckNumber = "",
      trailerNumber = "",
      referenceNumber = "",
      materialType = "",
      origin = "",
      destination = "",
      grossWeight,
      tareWeight,
      netWeight,
      notes = "",
    } = body;

    // Calculate net weight if not provided
    const calculatedNet =
      netWeight !== undefined && netWeight !== null
        ? netWeight
        : grossWeight !== undefined && tareWeight !== undefined && !isNaN(grossWeight) && !isNaN(tareWeight)
          ? grossWeight - tareWeight
          : undefined;

    // Parse date and times
    const ticketDate = date ? new Date(date) : new Date();
    const timeInDate = timeIn ? new Date(`${date}T${timeIn}`) : ticketDate;
    const timeOutDate = timeOut ? new Date(`${date}T${timeOut}`) : undefined;

    // Save to database (optional - continue even if it fails)
    let savedTicket;
    let dbSaveFailed = false;
    const finalTicketNumber = ticketNumber || `WT-${Date.now()}`;
    
    try {
      savedTicket = await prisma.scaleTransaction.create({
        data: {
          ticketNumber: finalTicketNumber,
          transactionType: "inbound",
          status: "completed",
          haulerCompany: carrierCompany || undefined,
          licensePlate: truckNumber || "N/A",
          driverName: driverName || "N/A",
          materialType: materialType || "Unknown",
          materialDescription: notes || undefined,
          grossWeight: grossWeight ? Number(grossWeight) : undefined,
          tareWeight: tareWeight ? Number(tareWeight) : undefined,
          netWeight: calculatedNet,
          timeIn: timeInDate,
          timeOut: timeOutDate || undefined,
          operatorNotes: notes || undefined,
        },
      });
      console.log("Ticket saved successfully:", savedTicket.ticketNumber);
    } catch (dbError) {
      console.warn("Database save failed (continuing with email):", dbError);
      dbSaveFailed = true;
      // Continue without database save - email will still be sent
    }

    // Generate PDF
    const responseTicketNumber = savedTicket?.ticketNumber || finalTicketNumber;
    const pdfBuffer = await renderToBuffer(
      <WeighTicketPDF
        ticketNumber={ticketNumber || responseTicketNumber}
        date={date || ticketDate.toISOString().split("T")[0]}
        timeIn={timeIn}
        timeOut={timeOut}
        carrierCompany={carrierCompany}
        driverName={driverName}
        truckNumber={truckNumber}
        trailerNumber={trailerNumber}
        referenceNumber={referenceNumber}
        materialType={materialType}
        origin={origin}
        destination={destination}
        grossWeight={grossWeight ? Number(grossWeight) : undefined}
        tareWeight={tareWeight ? Number(tareWeight) : undefined}
        netWeight={calculatedNet}
        notes={notes}
      />
    );

    // Convert PDF buffer to base64 for email attachment
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    // Send email with PDF attachment
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || "Soil Seed & Water <ralvarez@soilseedandwater.com>";
    const toEmail = "ralvarez@soilseedandwater.com";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Email service is not configured (missing RESEND_API_KEY)." },
        { status: 500 },
      );
    }

    const subject = `Weigh Ticket ${ticketNumber || responseTicketNumber}`.trim();

    const textLines = [
      `Ticket: ${ticketNumber || responseTicketNumber}`,
      ...(dbSaveFailed ? [`Note: This ticket was not saved to the database (connection unavailable)`] : []),
      `Date: ${date || "N/A"}`,
      `Time In: ${timeIn || "N/A"}`,
      `Time Out: ${timeOut || "N/A"}`,
      `Carrier/Company: ${carrierCompany || "N/A"}`,
      `Driver: ${driverName || "N/A"}`,
      `Truck #: ${truckNumber || "N/A"}`,
      `Trailer #: ${trailerNumber || "N/A"}`,
      `Reference/BOL: ${referenceNumber || "N/A"}`,
      `Material: ${materialType || "N/A"}`,
      `Origin: ${origin || "N/A"}`,
      `Destination: ${destination || "N/A"}`,
      `Gross: ${formatLbs(grossWeight)}`,
      `Tare: ${formatLbs(tareWeight)}`,
      `Net: ${formatLbs(calculatedNet)}`,
      `Notes: ${notes || "—"}`,
    ];

    const safeNotes = notes ? escapeHtml(notes).replace(/\n/g, "<br/>") : "—";

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#111827">
        <h2 style="margin:0 0 12px;font-size:18px;color:#065f46">New Weigh Ticket Submitted</h2>
        <p style="margin:0 0 16px;color:#4b5563">A weigh ticket has been saved to the database. The PDF is attached to this email.</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tbody>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Ticket #</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${safeValue(ticketNumber || responseTicketNumber)}</td></tr>
            ${dbSaveFailed ? `<tr><td colspan="2" style="padding:6px 8px;color:#dc2626;font-weight:600;background:#fee2e2;border-radius:4px;margin-top:8px">⚠️ Note: This ticket was not saved to the database (connection unavailable)</td></tr>` : ""}
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Date</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${safeValue(date)}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Time In / Out</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${safeValue(timeIn, "—")} / ${safeValue(timeOut, "—")}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Carrier / Driver</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${safeValue(carrierCompany)} / ${safeValue(driverName)}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Truck / Trailer</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${safeValue(truckNumber)} / ${safeValue(trailerNumber)}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Reference / BOL</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${safeValue(referenceNumber)}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Material</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${safeValue(materialType)}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Origin / Destination</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${safeValue(origin)} / ${safeValue(destination)}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Gross</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${formatLbs(grossWeight)}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#374151">Tare</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb">${formatLbs(tareWeight)}</td></tr>
            <tr><td style="padding:6px 8px;font-weight:600;color:#065f46">Net</td><td style="padding:6px 8px;border-left:1px solid #e5e7eb;color:#065f46;font-weight:700">${formatLbs(calculatedNet)}</td></tr>
          </tbody>
        </table>
        <div style="margin-top:12px;padding:10px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb">
          <div style="font-weight:600;color:#374151;margin-bottom:6px">Notes</div>
          <div style="color:#4b5563">${safeNotes}</div>
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
        attachments: [
          {
            filename: `weigh-ticket-${responseTicketNumber}.pdf`,
            content: pdfBase64,
          },
        ],
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

    return NextResponse.json({ 
      success: true, 
      ticketId: savedTicket?.id,
      ticketNumber: responseTicketNumber,
      dbSaveFailed,
    });
  } catch (error) {
    console.error("Save and email error:", error);
    return NextResponse.json({ error: "Failed to save and send email" }, { status: 500 });
  }
}

