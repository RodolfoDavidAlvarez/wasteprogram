import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    // Parse date and times - handle empty date string
    let ticketDate: Date;
    let timeInDate: Date;
    let timeOutDate: Date | undefined;
    
    try {
      ticketDate = date ? new Date(date) : new Date();
      if (isNaN(ticketDate.getTime())) {
        ticketDate = new Date();
      }
      timeInDate = timeIn && date ? new Date(`${date}T${timeIn}`) : ticketDate;
      if (isNaN(timeInDate.getTime())) {
        timeInDate = ticketDate;
      }
      timeOutDate = timeOut && date ? new Date(`${date}T${timeOut}`) : undefined;
      if (timeOutDate && isNaN(timeOutDate.getTime())) {
        timeOutDate = undefined;
      }
    } catch (dateError) {
      console.error("Date parsing error:", dateError);
      ticketDate = new Date();
      timeInDate = ticketDate;
      timeOutDate = undefined;
    }

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
      console.warn("Database save failed (continuing with PDF generation):", dbError);
      dbSaveFailed = true;
      // Continue without database save - PDF generation will still work
    }

    // Generate PDF
    let pdfBuffer;
    try {
      pdfBuffer = await renderToBuffer(
        <WeighTicketPDF
          ticketNumber={ticketNumber || (savedTicket?.ticketNumber || finalTicketNumber)}
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
      console.log("PDF generated successfully");
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      throw new Error(`PDF generation error: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`);
    }

    const responseTicketNumber = savedTicket?.ticketNumber || finalTicketNumber;
    
    // Return PDF with warning header if database save failed
    const headers: Record<string, string> = {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="weigh-ticket-${responseTicketNumber}.pdf"`,
    };
    
    if (dbSaveFailed) {
      headers["X-Database-Save-Failed"] = "true";
    }

    return new NextResponse(Buffer.from(pdfBuffer), { headers });
  } catch (error) {
    console.error("Save and download error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : String(error);
    console.error("Error details:", errorStack);
    return NextResponse.json(
      { 
        error: "Failed to save and generate PDF",
        detail: errorMessage,
      },
      { status: 500 }
    );
  }
}

