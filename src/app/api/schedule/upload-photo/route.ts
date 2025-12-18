import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    // Get current delivery record
    const record = await prisma.deliveryRecord.findUnique({
      where: { vrNumber },
    });

    if (!record) {
      return NextResponse.json({ error: "Delivery record not found" }, { status: 404 });
    }

    // Parse existing photoUrls or initialize empty array
    const existingPhotos: string[] = record.photoUrls ? JSON.parse(record.photoUrls) : [];
    existingPhotos.push(photoUrl);

    // Update record with new photo URL
    const updatedRecord = await prisma.deliveryRecord.update({
      where: { vrNumber },
      data: {
        photoUrls: JSON.stringify(existingPhotos),
      },
    });

    return NextResponse.json({
      success: true,
      photoUrl,
      totalPhotos: existingPhotos.length,
      record: updatedRecord
    });
  } catch (error: any) {
    console.error("Error uploading photo:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
