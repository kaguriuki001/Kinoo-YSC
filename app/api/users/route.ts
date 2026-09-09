import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { connectDB } = await import("@/lib/db");
    const User = (await import("@/models/User")).default;
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}