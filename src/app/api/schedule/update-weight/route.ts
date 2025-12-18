import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { vrNumber, weightLbs } = await request.json();

    if (!vrNumber) {
      return NextResponse.json({ error: "VR number is required" }, { status: 400 });
    }

    if (weightLbs === undefined || weightLbs === null) {
      return NextResponse.json({ error: "Weight is required" }, { status: 400 });
    }

    // Convert lbs to tons (1 ton = 2000 lbs)
    const tonnage = weightLbs / 2000;

    // Update the delivery record
    const { data, error } = await supabase
      .from("wd_delivery_records")
      .update({
        tonnage,
        updatedAt: new Date().toISOString()
      })
      .eq("vrNumber", vrNumber)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating weight:", error);
      return NextResponse.json({ error: "Failed to update weight" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Delivery record not found" }, { status: 404 });
    }

    // Revalidate the schedule page
    revalidatePath("/schedule");

    return NextResponse.json({
      success: true,
      record: data,
      weightLbs,
      tonnage,
    });
  } catch (error) {
    console.error("Error updating weight:", error);
    return NextResponse.json({ error: "Failed to update weight" }, { status: 500 });
  }
}
