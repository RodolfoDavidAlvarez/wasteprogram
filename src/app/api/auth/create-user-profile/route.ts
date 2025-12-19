import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { authUserId: userId },
    });

    if (existingUser) {
      return NextResponse.json({ user: existingUser });
    }

    // Create new user profile
    const user = await prisma.user.create({
      data: {
        authUserId: userId,
        email,
        name,
        role: "admin", // First user gets admin role
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error creating user profile:", error);
    return NextResponse.json(
      { error: "Failed to create user profile" },
      { status: 500 }
    );
  }
}
