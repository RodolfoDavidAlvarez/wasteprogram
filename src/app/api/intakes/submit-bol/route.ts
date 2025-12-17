import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const intakeId = formData.get("intakeId") as string

    if (!intakeId) {
      return NextResponse.json({ error: "Missing intakeId" }, { status: 400 })
    }

    // Get the intake to verify it exists
    const intake = await prisma.wasteIntake.findUnique({
      where: { id: intakeId },
    })

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "bol", intakeId)
    await mkdir(uploadsDir, { recursive: true })

    // Process uploaded files
    const files: string[] = []
    let fileIndex = 0

    while (formData.has(`file${fileIndex}`)) {
      const file = formData.get(`file${fileIndex}`) as File
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const timestamp = Date.now()
      const ext = file.name.split(".").pop()
      const filename = `bol_${timestamp}_${fileIndex}.${ext}`
      const filepath = path.join(uploadsDir, filename)

      // Save file
      await writeFile(filepath, buffer)
      files.push(`/uploads/bol/${intakeId}/${filename}`)

      fileIndex++
    }

    // Update the intake record with a processing note
    await prisma.wasteIntake.update({
      where: { id: intakeId },
      data: {
        processingNote: `BOL documentation uploaded on ${new Date().toLocaleString()} - ${files.length} file(s)`,
        // You could add a new field to store the file paths if needed
      },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${files.length} file(s)`,
      files,
    })
  } catch (error) {
    console.error("BOL upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload BOL" },
      { status: 500 }
    )
  }
}
