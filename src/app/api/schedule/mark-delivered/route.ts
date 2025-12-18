import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { vrNumber, deliveredBy } = await request.json();

    if (!vrNumber) {
      return NextResponse.json({ error: "VR number is required" }, { status: 400 });
    }

    const { data: record, error } = await supabase
      .from("wd_delivery_records")
      .update({
        status: "delivered",
        deliveredAt: new Date().toISOString(),
        deliveredBy: deliveredBy || "Field Team",
        updatedAt: new Date().toISOString(),
      })
      .eq("vrNumber", vrNumber)
      .select("*")
      .single();

    if (error) {
      // Mirror old behavior: record not found
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Delivery record not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, record });
  } catch (error: unknown) {
    console.error("Error marking as delivered:", error);

    return NextResponse.json({ error: "Failed to mark as delivered" }, { status: 500 });
  }
}
