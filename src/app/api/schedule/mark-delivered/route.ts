import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { vrNumber, deliveredBy } = await request.json();

    if (!vrNumber) {
      return NextResponse.json({ error: "VR number is required" }, { status: 400 });
    }

    // Update delivery record to delivered status
    const record = await prisma.deliveryRecord.update({
      where: { vrNumber },
      data: {
        status: "delivered",
        deliveredAt: new Date(),
        deliveredBy: deliveredBy || "Field Team",
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error: unknown) {
    console.error("Error marking as delivered:", error);

    // Handle record not found
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Delivery record not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to mark as delivered" }, { status: 500 });
  }
}
