import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ vrNumber: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { vrNumber } = await params;

    if (!vrNumber) {
      return NextResponse.json({ error: "VR number is required" }, { status: 400 });
    }

    // Try to find existing record
    const record = await prisma.deliveryRecord.findUnique({
      where: { vrNumber },
    });

    // If not found, return null - record will be created when needed
    if (!record) {
      return NextResponse.json({ record: null });
    }

    // Parse photoUrls for the response
    const photoUrls = record.photoUrls ? JSON.parse(record.photoUrls) : [];

    return NextResponse.json({
      record: {
        ...record,
        photoUrls,
      }
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

    // Upsert the delivery record
    const record = await prisma.deliveryRecord.upsert({
      where: { vrNumber },
      update: {
        ...(body as Record<string, unknown>),
        updatedAt: new Date(),
      },
      create: {
        vrNumber,
        loadNumber: typeof body.loadNumber === "number" ? body.loadNumber : 0,
        status: typeof body.status === "string" ? body.status : "scheduled",
        tonnage: typeof body.tonnage === "number" ? body.tonnage : 20,
        scheduledDate: typeof body.scheduledDate === "string" ? new Date(body.scheduledDate) : new Date(),
        notes: typeof body.notes === "string" ? body.notes : undefined,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error: unknown) {
    console.error("Error creating/updating delivery record:", error);
    return NextResponse.json({ error: "Failed to save delivery record" }, { status: 500 });
  }
}
