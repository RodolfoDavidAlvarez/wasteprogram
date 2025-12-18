import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { uploadDeliveryPhoto } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const vrNumber = formData.get("vrNumber") as string;

    if (!file || !vrNumber) {
      return NextResponse.json({ error: "File and VR number are required" }, { status: 400 });
    }

    // Upload photo to Supabase Storage
    const photoUrl = await uploadDeliveryPhoto(file, vrNumber);

    const { data: record, error: findErr } = await supabase.from("wd_delivery_records").select("*").eq("vrNumber", vrNumber).maybeSingle();
    if (findErr) throw findErr;
    if (!record) return NextResponse.json({ error: "Delivery record not found" }, { status: 404 });

    const existingPhotos: string[] = record.photoUrls ? JSON.parse(record.photoUrls) : [];
    existingPhotos.push(photoUrl);

    const { data: updatedRecord, error: updateErr } = await supabase
      .from("wd_delivery_records")
      .update({ photoUrls: JSON.stringify(existingPhotos), updatedAt: new Date().toISOString() })
      .eq("vrNumber", vrNumber)
      .select("*")
      .single();
    if (updateErr) throw updateErr;

    // Revalidate the schedule page so it shows updated data
    revalidatePath("/schedule");

    return NextResponse.json({
      success: true,
      photoUrl,
      totalPhotos: existingPhotos.length,
      record: updatedRecord,
    });
  } catch (error: unknown) {
    console.error("Error uploading photo:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
