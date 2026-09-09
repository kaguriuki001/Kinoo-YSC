import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const { connectDB } = await import("@/lib/db");
    const User = (await import("@/models/User")).default;
    await connectDB();

    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) formattedPhone = "254" + formattedPhone.substring(1);
    if (formattedPhone.startsWith("7")) formattedPhone = "254" + formattedPhone;

    const user = await User.findOne({ phone: formattedPhone });
    if (!user) return NextResponse.json({ error: "Phone not found" }, { status: 404 });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production, send OTP via SMS/WhatsApp
    // For now, return it (dev only)
    return NextResponse.json({ message: "OTP generated", otp });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}