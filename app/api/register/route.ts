import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { fullName, phone, password, idNumber } = await req.json();

    if (!fullName || !phone || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) formattedPhone = "254" + formattedPhone.substring(1);
    if (formattedPhone.startsWith("7")) formattedPhone = "254" + formattedPhone;

    const { connectDB } = await import("@/lib/db");
    const User = (await import("@/models/User")).default;
    await connectDB();

    const existing = await User.findOne({ phone: formattedPhone });
    if (existing) return NextResponse.json({ error: "Phone already registered" }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 12);
    const totalUsers = await User.countDocuments();

    let roles = ['member'];
    let status = 'pending';

    if (totalUsers === 0) {
      roles = ['father', 'moderator', 'secretary', 'treasurer', 'organizing_secretary', 'vice_secretary', 'liturgist', 'vice_moderator', 'patron_matron', 'member'];
      status = 'active';
    }

    const user = await User.create({ fullName, phone: formattedPhone, passwordHash, idNumber, status, roles });

    return NextResponse.json({ 
      message: status === 'active' ? "Registration successful! You are the Supreme Admin." : "Registration submitted for approval.",
      status 
    });

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed. Try again." }, { status: 500 });
  }
}