import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ vrNumber: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { vrNumber } = await params;

    if (!vrNumber) {
      return NextResponse.json({ error: "VR number is required" }, { status: 400 });
    }

    let { data: record, error } = await supabase.from("wd_delivery_records").select("*").eq("vrNumber", vrNumber).maybeSingle();
    if (error) throw error;

    // If not found, auto-create a scheduled record so the detail page works
    if (!record) {
      const now = new Date().toISOString();
      const { data: newRecord, error: createError } = await supabase
        .from("wd_delivery_records")
        .insert({
          id: crypto.randomUUID(),
          vrNumber,
          loadNumber: 0,
          status: "scheduled",
          tonnage: 20,
          scheduledDate: now,
          notes: null,
          photoUrls: "[]",
          createdAt: now,
          updatedAt: now,
        })
        .select("*")
        .single();

      if (createError) throw createError;
      record = newRecord;
    }

    // Parse photoUrls for the response
    const photoUrls = record.photoUrls ? JSON.parse(record.photoUrls) : [];

    return NextResponse.json({
      record: {
        ...record,
        photoUrls,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching delivery record:", error);
    return NextResponse.json({ error: "Failed to fetch delivery record" }, { status: 500 });
  }
}

// Create or update a delivery record
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { vrNumber } = await params;
    const body: Record<string, unknown> = await request.json();

    if (!vrNumber) {
      return NextResponse.json({ error: "VR number is required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const scheduledDate = typeof body.scheduledDate === "string" ? new Date(body.scheduledDate).toISOString() : now;

    // Supabase upsert (vrNumber is unique)
    const upsertPayload = {
      id: crypto.randomUUID(),
      vrNumber,
      loadNumber: typeof body.loadNumber === "number" ? body.loadNumber : 0,
      status: typeof body.status === "string" ? body.status : "scheduled",
      tonnage: typeof body.tonnage === "number" ? body.tonnage : 20,
      scheduledDate,
      notes: typeof body.notes === "string" ? body.notes : null,
      updatedAt: now,
      createdAt: now,
    };

    const { data: record, error } = await supabase
      .from("wd_delivery_records")
      .upsert(upsertPayload, { onConflict: "vrNumber" })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, record });
  } catch (error: unknown) {
    console.error("Error creating/updating delivery record:", error);
    return NextResponse.json({ error: "Failed to save delivery record" }, { status: 500 });
  }
}
