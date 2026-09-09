import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = await req.json();
    const { connectDB } = await import("@/lib/db");
    const User = (await import("@/models/User")).default;
    await connectDB();

    await User.findByIdAndUpdate(userId, { 
      $addToSet: { roles: role },
      status: 'active'
    });

    return NextResponse.json({ message: "Role assigned" });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}