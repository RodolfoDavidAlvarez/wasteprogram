import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { vrNumber, weightTicketUrl } = await request.json();

    if (!vrNumber || !weightTicketUrl) {
      return NextResponse.json(
        { error: "vrNumber and weightTicketUrl are required" },
        { status: 400 }
      );
    }

    // Fetch current record
    const { data: record, error: fetchError } = await supabase
      .from("wd_delivery_records")
      .select("weightTicketUrls")
      .eq("vrNumber", vrNumber)
      .single();

    if (fetchError || !record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    // Parse existing tickets and remove the specified one
    const existingTickets: string[] = record.weightTicketUrls
      ? JSON.parse(record.weightTicketUrls)
      : [];
    const updatedTickets = existingTickets.filter((url) => url !== weightTicketUrl);

    // Update record with new ticket list
    const { error: updateError } = await supabase
      .from("wd_delivery_records")
      .update({
        weightTicketUrls: JSON.stringify(updatedTickets),
        updatedAt: new Date().toISOString(),
      })
      .eq("vrNumber", vrNumber);

    if (updateError) {
      console.error("Failed to update record:", updateError);
      return NextResponse.json(
        { error: "Failed to delete weight ticket" },
        { status: 500 }
      );
    }

    // Optionally delete from Supabase storage if the URL is a Supabase storage URL
    if (weightTicketUrl.includes("supabase.co/storage")) {
      try {
        // Extract the path from the URL
        const urlParts = weightTicketUrl.split("/delivery-photos/");
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from("delivery-photos").remove([filePath]);
        }
      } catch (storageError) {
        // Log but don't fail if storage deletion fails
        console.error("Failed to delete from storage:", storageError);
      }
    }

    // Revalidate the schedule page
    revalidatePath("/schedule");

    return NextResponse.json({ success: true, weightTicketUrls: updatedTickets });
  } catch (error) {
    console.error("Error deleting weight ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


