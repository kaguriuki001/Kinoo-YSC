import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

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

export async function POST(req: NextRequest) {
  try {
    const { fullName, phone, password, idNumber, outstation, paidCash } = await req.json();

    if (!fullName || !phone || !password) {
      return NextResponse.json({ error: "Full name, phone and password required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    if (!outstation || !['Uthiru', 'Kagondo', 'Kinoo'].includes(outstation)) {
      return NextResponse.json({ error: "Valid outstation required (Uthiru, Kagondo, Kinoo)" }, { status: 400 });
    }

    const formattedPhone = formatPhone(phone);
    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const existing = await db.collection('users').findOne({ phone: formattedPhone });
    if (existing) {
      return NextResponse.json({ error: "Phone already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const totalUsers = await db.collection('users').countDocuments();

    let roles = ['member'];
    let status = 'active';

    if (totalUsers === 0) {
      roles = ['father', 'moderator', 'member'];
      status = 'active';
    } else {
      roles = ['member'];
      status = 'active';
    }

    const result = await db.collection('users').insertOne({
      fullName,
      phone: formattedPhone,
      passwordHash,
      idNumber: idNumber || null,
      outstation,
      roles,
      status,
      paidCash: paidCash === true,
      registrationFee: 100,
      photo: null,
      pairId: null,
      twoFactorEnabled: false,
      whatsappRegistered: false,
      createdAt: new Date(),
      __v: 0
    });

    return NextResponse.json({
      message: roles.includes('father')
        ? "Welcome! You are the founding admin."
        : "Registration successful! You are now a member.",
      userId: result.insertedId.toString(),
      roles,
      memberNumber: totalUsers + 1
    });

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
