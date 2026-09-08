import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { fullName, phone, password, idNumber } = await req.json();

    // Validate input
    if (!fullName || !phone || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Format phone number
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith("7")) {
      formattedPhone = "254" + formattedPhone;
    } else if (formattedPhone.startsWith("1")) {
      formattedPhone = "254" + formattedPhone;
    }

    // Check if user exists
    const existing = await User.findOne({ phone: formattedPhone });
    if (existing) {
      return NextResponse.json({ error: "Phone already registered" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Check how many users exist
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });

    // Auto-approve logic:
    // - If no users exist, make them Father/Moderator (first user = supreme admin)
    // - If fewer than 5 active users, auto-approve as member
    // - Otherwise, require Secretary/Moderator approval
    let roles = ['member'];
    let status = 'pending';

    if (totalUsers === 0) {
      // First user becomes Father + Moderator + everything
      roles = ['father', 'moderator', 'secretary', 'treasurer', 'organizing_secretary', 'vice_secretary', 'liturgist', 'vice_moderator', 'patron_matron', 'member'];
      status = 'active';
      console.log("First user registered as SUPREME ADMIN");
    } else if (activeUsers < 5) {
      // First 5 active users get auto-approved
      status = 'active';
      console.log(`Auto-approved user ${activeUsers + 1} of 5 (early registration phase)`);
    } else {
      // Normal flow - pending approval
      status = 'pending';
      console.log("User registered, awaiting Secretary/Moderator approval");
    }

    // Create user
    const user = await User.create({
      fullName,
      phone: formattedPhone,
      passwordHash,
      idNumber,
      status,
      roles
    });

    return NextResponse.json({ 
      message: status === 'active' ? "Registration successful! You can login now." : "Registration submitted for approval",
      userId: user._id,
      status,
      roles
    });

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}