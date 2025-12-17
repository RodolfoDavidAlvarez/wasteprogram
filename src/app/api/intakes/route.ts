import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateTicketNumber } from "@/lib/utils"
import { createIntakeSchema, intakeQuerySchema, formatZodError } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      status: searchParams.get("status") || undefined,
      clientId: searchParams.get("clientId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "50",
    }

    const validatedQuery = intakeQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: formatZodError(validatedQuery.error) },
        { status: 400 }
      )
    }

    const { status, clientId, startDate, endDate, page, limit } = validatedQuery.data
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (startDate || endDate) {
      where.scheduledDate = {}
      if (startDate) {
        (where.scheduledDate as Record<string, unknown>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.scheduledDate as Record<string, unknown>).lte = new Date(endDate)
      }
    }

    const [intakes, total] = await Promise.all([
      prisma.wasteIntake.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              accountNumber: true,
            },
          },
        },
        orderBy: { scheduledDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.wasteIntake.count({ where }),
    ])

    return NextResponse.json({
      data: intakes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching intakes:", error)
    return NextResponse.json(
      { error: "Failed to fetch intakes" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validatedData = createIntakeSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(validatedData.error) },
        { status: 400 }
      )
    }

    const data = validatedData.data

    // Get client's tipping fee rate if not provided
    let tippingFeeRate = data.tippingFeeRate
    if (!tippingFeeRate) {
      const client = await prisma.client.findUnique({
        where: { id: data.clientId },
        select: { tippingFeeRate: true },
      })
      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        )
      }
      tippingFeeRate = client.tippingFeeRate || 45.00
    }

    const intake = await prisma.wasteIntake.create({
      data: {
        ticketNumber: generateTicketNumber(),
        clientId: data.clientId,
        wasteType: data.wasteType,
        wasteDescription: data.wasteDescription || null,
        estimatedWeight: data.estimatedWeight,
        packagingType: data.packagingType,
        deliveryType: data.deliveryType,
        scheduledDate: data.scheduledDate,
        scheduledTimeWindow: data.scheduledTimeWindow || null,
        pickupAddress: data.pickupAddress || null,
        pickupCity: data.pickupCity || null,
        pickupState: data.pickupState || null,
        pickupZip: data.pickupZip || null,
        vehicleType: data.vehicleType || null,
        driverContact: data.driverContact || null,
        onSiteContact: data.onSiteContact || null,
        onSitePhone: data.onSitePhone || null,
        isRecurring: data.isRecurring,
        recurringFrequency: data.recurringFrequency || null,
        temperatureRequirement: data.temperatureRequirement || null,
        hasOdorConcerns: data.hasOdorConcerns,
        hasLeakageConcerns: data.hasLeakageConcerns,
        equipmentNeeded: data.equipmentNeeded || null,
        specialInstructions: data.specialInstructions || null,
        contaminationCertified: data.contaminationCertified,
        contaminationNotes: data.contaminationNotes || null,
        tippingFeeRate: tippingFeeRate,
        poNumber: data.poNumber || null,
        status: "pending",
      },
      include: {
        client: {
          select: {
            companyName: true,
            operationalEmail: true,
          },
        },
      },
    })

    return NextResponse.json(intake, { status: 201 })
  } catch (error) {
    console.error("Error creating intake:", error)
    return NextResponse.json(
      { error: "Failed to create intake" },
      { status: 500 }
    )
  }
}
