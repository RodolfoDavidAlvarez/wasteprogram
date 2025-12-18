import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { vrNumber, photoUrl } = await request.json();

    if (!vrNumber || !photoUrl) {
      return NextResponse.json(
        { error: "vrNumber and photoUrl are required" },
        { status: 400 }
      );
    }

    // Fetch current record
    const { data: record, error: fetchError } = await supabase
      .from("wd_delivery_records")
      .select("photoUrls")
      .eq("vrNumber", vrNumber)
      .single();

    if (fetchError || !record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    // Parse existing photos and remove the specified one
    const existingPhotos: string[] = record.photoUrls
      ? JSON.parse(record.photoUrls)
      : [];
    const updatedPhotos = existingPhotos.filter((url) => url !== photoUrl);

    // Update record with new photo list
    const { error: updateError } = await supabase
      .from("wd_delivery_records")
      .update({
        photoUrls: JSON.stringify(updatedPhotos),
        updatedAt: new Date().toISOString(),
      })
      .eq("vrNumber", vrNumber);

    if (updateError) {
      console.error("Failed to update record:", updateError);
      return NextResponse.json(
        { error: "Failed to delete photo" },
        { status: 500 }
      );
    }

    // Optionally delete from Supabase storage if the URL is a Supabase storage URL
    if (photoUrl.includes("supabase.co/storage")) {
      try {
        // Extract the path from the URL
        const urlParts = photoUrl.split("/delivery-photos/");
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from("delivery-photos").remove([filePath]);
        }
      } catch (storageError) {
        // Log but don't fail if storage deletion fails
        console.error("Failed to delete from storage:", storageError);
      }
    }

    // Revalidate the schedule page so it shows updated data
    revalidatePath("/schedule");

    return NextResponse.json({ success: true, photoUrls: updatedPhotos });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
