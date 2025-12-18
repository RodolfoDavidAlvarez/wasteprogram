import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { vrNumber } = await request.json();

    if (!vrNumber) {
      return NextResponse.json(
        { error: "vrNumber is required" },
        { status: 400 }
      );
    }

    // Update record to scheduled status
    const { data, error } = await supabase
      .from("wd_delivery_records")
      .update({
        status: "scheduled",
        deliveredAt: null,
        deliveredBy: null,
        updatedAt: new Date().toISOString(),
      })
      .eq("vrNumber", vrNumber)
      .select()
      .single();

    if (error) {
      console.error("Failed to undo delivery:", error);
      return NextResponse.json(
        { error: "Failed to undo delivery status" },
        { status: 500 }
      );
    }

    // Revalidate the schedule page so it shows updated data
    revalidatePath("/schedule");

    return NextResponse.json({ success: true, record: data });
  } catch (error) {
    console.error("Error undoing delivery:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
