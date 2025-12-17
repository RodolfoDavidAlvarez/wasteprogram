import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateClientSchema, formatZodError } from "@/lib/validations"
import { z } from "zod"

const idSchema = z.string().uuid("Invalid client ID")

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const validatedId = idSchema.safeParse(id)
    if (!validatedId.success) {
      return NextResponse.json(
        { error: "Invalid client ID format" },
        { status: 400 }
      )
    }

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        intakes: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        contracts: true,
        _count: {
          select: { intakes: true },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json(
      { error: "Failed to fetch client" },
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
        { error: "Invalid client ID format" },
        { status: 400 }
      )
    }

    const body = await request.json()

    const validatedData = updateClientSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(validatedData.error) },
        { status: 400 }
      )
    }

    const data = validatedData.data

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    })

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        companyName: data.companyName,
        operationalContact: data.operationalContact,
        operationalEmail: data.operationalEmail,
        operationalPhone: data.operationalPhone,
        billingContact: data.billingContact,
        billingEmail: data.billingEmail,
        billingPhone: data.billingPhone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        contractReference: data.contractReference,
        tippingFeeRate: data.tippingFeeRate,
        notes: data.notes,
        status: data.status,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json(
      { error: "Failed to update client" },
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
        { error: "Invalid client ID format" },
        { status: 400 }
      )
    }

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    })

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Check for associated intakes
    const intakeCount = await prisma.wasteIntake.count({
      where: { clientId: id },
    })

    if (intakeCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete client with associated intakes. Deactivate instead." },
        { status: 400 }
      )
    }

    await prisma.client.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    )
  }
}
