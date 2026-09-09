import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { userId, newPassword } = await req.json();
    const { connectDB } = await import("@/lib/db");
    const User = (await import("@/models/User")).default;
    await connectDB();

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(userId, { passwordHash });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}