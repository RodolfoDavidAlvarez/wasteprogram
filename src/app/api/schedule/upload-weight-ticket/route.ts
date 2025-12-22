import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const vrNumber = formData.get("vrNumber") as string;

    if (!file || !vrNumber) {
      return NextResponse.json({ error: "File and VR number are required" }, { status: 400 });
    }

    // Validate file type (PDF or HTML)
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const isValidType = 
      fileType === "application/pdf" ||
      fileType === "text/html" ||
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".html");

    if (!isValidType) {
      return NextResponse.json(
        { error: "Only PDF and HTML files are allowed for weight tickets" },
        { status: 400 }
      );
    }

    // Upload weight ticket to Supabase Storage (using delivery-photos bucket for now, or create a documents bucket)
    // For now, we'll use the delivery-photos bucket but in a weight-tickets subfolder
    const timestamp = Date.now();
    const fileExtension = fileName.endsWith(".html") ? "html" : "pdf";
    const fileNameStorage = `${vrNumber}/weight-ticket-${timestamp}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("delivery-photos")
      .upload(fileNameStorage, file, {
        contentType: fileType || (fileExtension === "pdf" ? "application/pdf" : "text/html"),
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("delivery-photos").getPublicUrl(fileNameStorage);
    const weightTicketUrl = urlData.publicUrl;

    // Get existing record
    const { data: record, error: findErr } = await supabase
      .from("wd_delivery_records")
      .select("*")
      .eq("vrNumber", vrNumber)
      .maybeSingle();
    
    if (findErr) throw findErr;
    if (!record) return NextResponse.json({ error: "Delivery record not found" }, { status: 404 });

    // Update weightTicketUrls (JSON array)
    const existingTickets: string[] = record.weightTicketUrls ? JSON.parse(record.weightTicketUrls) : [];
    existingTickets.push(weightTicketUrl);

    const { data: updatedRecord, error: updateErr } = await supabase
      .from("wd_delivery_records")
      .update({
        weightTicketUrls: JSON.stringify(existingTickets),
        updatedAt: new Date().toISOString(),
      })
      .eq("vrNumber", vrNumber)
      .select("*")
      .single();
    
    if (updateErr) throw updateErr;

    // Revalidate the schedule page
    revalidatePath("/schedule");

    return NextResponse.json({
      success: true,
      weightTicketUrl,
      totalTickets: existingTickets.length,
      record: updatedRecord,
    });
  } catch (error: unknown) {
    console.error("Error uploading weight ticket:", error);
    return NextResponse.json({ error: "Failed to upload weight ticket" }, { status: 500 });
  }
}

