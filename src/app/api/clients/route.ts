import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateAccountNumber } from "@/lib/utils"
import { createClientSchema, clientQuerySchema, formatZodError } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "50",
    }

    const validatedQuery = clientQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: formatZodError(validatedQuery.error) },
        { status: 400 }
      )
    }

    const { status, search, page, limit } = validatedQuery.data
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { accountNumber: { contains: search } },
        { operationalContact: { contains: search } },
      ]
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          _count: {
            select: { intakes: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ])

    return NextResponse.json({
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validatedData = createClientSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(validatedData.error) },
        { status: 400 }
      )
    }

    const data = validatedData.data

    const client = await prisma.client.create({
      data: {
        accountNumber: generateAccountNumber(),
        companyName: data.companyName,
        operationalContact: data.operationalContact,
        operationalEmail: data.operationalEmail,
        operationalPhone: data.operationalPhone,
        billingContact: data.billingContact || null,
        billingEmail: data.billingEmail || null,
        billingPhone: data.billingPhone || null,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        contractReference: data.contractReference || null,
        tippingFeeRate: data.tippingFeeRate,
        notes: data.notes || null,
        status: "active",
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    )
  }
}
