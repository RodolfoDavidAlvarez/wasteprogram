import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("wd_delivery_records")
      .select("id, vrNumber, loadNumber, status, deliveredAt, deliveredBy, photoUrls, notes, tonnage, scheduledDate, createdAt, updatedAt")
      .order("scheduledDate", { ascending: false })
      .limit(500);

    if (error) {
      console.error("Error fetching delivery records:", error);
      throw error;
    }

    const records = (data ?? []).map((r) => ({
      ...r,
      photoUrls: r.photoUrls ? JSON.parse(r.photoUrls) : [],
    }));

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error listing delivery records:", error);
    return NextResponse.json({ error: "Failed to list delivery records" }, { status: 500 });
  }
}







