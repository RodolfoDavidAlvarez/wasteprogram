import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { WeighTicketPDF } from "@/components/weigh-ticket/WeighTicketPDF";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    const pdfBuffer = await renderToBuffer(
      <WeighTicketPDF
        ticketNumber={ticketNumber}
        date={date}
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

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="weigh-ticket-${ticketNumber || "new"}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}

