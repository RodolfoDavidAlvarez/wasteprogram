import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateIntakeSchema, formatZodError } from "@/lib/validations"
import { z } from "zod"

const idSchema = z.string().uuid("Invalid intake ID")

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const validatedId = idSchema.safeParse(id)
    if (!validatedId.success) {
      return NextResponse.json(
        { error: "Invalid intake ID format" },
        { status: 400 }
      )
    }

    const intake = await prisma.wasteIntake.findUnique({
      where: { id },
      include: {
        client: true,
        contaminationReports: true,
      },
    })

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 })
    }

    return NextResponse.json(intake)
  } catch (error) {
    console.error("Error fetching intake:", error)
    return NextResponse.json(
      { error: "Failed to fetch intake" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const validatedId = idSchema.safeParse(id)
    if (!validatedId.success) {
      return NextResponse.json(
        { error: "Invalid intake ID format" },
        { status: 400 }
      )
    }

    const body = await request.json()

    const validatedData = updateIntakeSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(validatedData.error) },
        { status: 400 }
      )
    }

    // Check if intake exists
    const existingIntake = await prisma.wasteIntake.findUnique({
      where: { id },
    })

    if (!existingIntake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 })
    }

    const data = validatedData.data

    // Calculate total charge if actual weight is provided
    let totalCharge = data.totalCharge
    if (data.actualWeight) {
      const rate = data.tippingFeeRate ?? existingIntake.tippingFeeRate ?? 45.00
      totalCharge = data.actualWeight * rate
    }

    const intake = await prisma.wasteIntake.update({
      where: { id },
      data: {
        wasteType: data.wasteType,
        wasteDescription: data.wasteDescription,
        estimatedWeight: data.estimatedWeight,
        actualWeight: data.actualWeight,
        packagingType: data.packagingType,
        deliveryType: data.deliveryType,
        scheduledDate: data.scheduledDate,
        scheduledTimeWindow: data.scheduledTimeWindow,
        pickupAddress: data.pickupAddress,
        pickupCity: data.pickupCity,
        pickupState: data.pickupState,
        pickupZip: data.pickupZip,
        vehicleType: data.vehicleType,
        driverContact: data.driverContact,
        onSiteContact: data.onSiteContact,
        onSitePhone: data.onSitePhone,
        isRecurring: data.isRecurring,
        recurringFrequency: data.recurringFrequency,
        temperatureRequirement: data.temperatureRequirement,
        hasOdorConcerns: data.hasOdorConcerns,
        hasLeakageConcerns: data.hasLeakageConcerns,
        equipmentNeeded: data.equipmentNeeded,
        specialInstructions: data.specialInstructions,
        contaminationCertified: data.contaminationCertified,
        contaminationNotes: data.contaminationNotes,
        status: data.status,
        receivedAt: data.receivedAt,
        inspectionNotes: data.inspectionNotes,
        contaminationFound: data.contaminationFound,
        tippingFeeRate: data.tippingFeeRate,
        totalCharge: totalCharge,
        poNumber: data.poNumber,
      },
      include: {
        client: true,
      },
    })

    return NextResponse.json(intake)
  } catch (error) {
    console.error("Error updating intake:", error)
    return NextResponse.json(
      { error: "Failed to update intake" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const validatedId = idSchema.safeParse(id)
    if (!validatedId.success) {
      return NextResponse.json(
        { error: "Invalid intake ID format" },
        { status: 400 }
      )
    }

    // Check if intake exists
    const existingIntake = await prisma.wasteIntake.findUnique({
      where: { id },
    })

    if (!existingIntake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 })
    }

    // Only allow deletion of pending intakes
    if (existingIntake.status !== "pending" && existingIntake.status !== "cancelled") {
      return NextResponse.json(
        { error: "Can only delete pending or cancelled intakes" },
        { status: 400 }
      )
    }

    await prisma.wasteIntake.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting intake:", error)
    return NextResponse.json(
      { error: "Failed to delete intake" },
      { status: 500 }
    )
  }
}
