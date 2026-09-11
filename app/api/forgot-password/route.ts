import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (!MONGODB_URI) throw new Error("MONGODB_URI missing");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

function formatPhone(phone: string): string {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) p = "254" + p.substring(1);
  if (p.startsWith("7") || p.startsWith("1")) p = "254" + p;
  return p;
}

// STEP 1: Request OTP
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: "Phone number required" }, { status: 400 });

    const formattedPhone = formatPhone(phone);
    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const user = await db.collection('users').findOne({ phone: formattedPhone });
    if (!user) {
      return NextResponse.json({ error: "Phone number not registered" }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await db.collection('password_resets').updateOne(
      { phone: formattedPhone },
      { $set: { phone: formattedPhone, otp, expiresAt, attempts: 0, createdAt: new Date() } },
      { upsert: true }
    );

    console.log(`🔐 OTP for ${formattedPhone}: ${otp}`);

    // TODO: Send OTP via SMS (Twilio) or WhatsApp
    // For now return in response
    return NextResponse.json({
      message: "OTP sent successfully",
      otp: otp, // ⚠️ Remove this in production
      phone: formattedPhone,
      expiresIn: 600
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// STEP 2: Verify OTP + Reset Password
export async function PUT(req: NextRequest) {
  try {
    const { phone, otp, newPassword } = await req.json();

    if (!phone || !otp || !newPassword) {
      return NextResponse.json({ error: "Phone, OTP, and new password required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const formattedPhone = formatPhone(phone);
    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const reset = await db.collection('password_resets').findOne({ phone: formattedPhone });
    if (!reset) {
      return NextResponse.json({ error: "No reset request found. Request OTP first." }, { status: 404 });
    }

    // Check attempts (max 5)
    if ((reset.attempts || 0) >= 5) {
      return NextResponse.json({ error: "Too many failed attempts. Request new OTP." }, { status: 429 });
    }

    // Check OTP
    if (reset.otp !== otp) {
      await db.collection('password_resets').updateOne(
        { phone: formattedPhone },
        { $inc: { attempts: 1 } }
      );
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Check expiry
    if (new Date(reset.expiresAt) < new Date()) {
      await db.collection('password_resets').deleteOne({ phone: formattedPhone });
      return NextResponse.json({ error: "OTP expired. Request a new one." }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user
    await db.collection('users').updateOne(
      { phone: formattedPhone },
      { $set: { passwordHash } }
    );

    // Delete OTP record
    await db.collection('password_resets').deleteOne({ phone: formattedPhone });

    console.log(`✅ Password reset for ${formattedPhone}`);

    return NextResponse.json({ message: "Password reset successfully! You can now login." });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}