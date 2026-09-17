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
      return NextResponse.json({ error: "Valid outstation required" }, { status: 400 });
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
    if (totalUsers === 0) roles = ['father', 'moderator', 'member'];

    const result = await db.collection('users').insertOne({
      fullName,
      phone: formattedPhone,
      passwordHash,
      idNumber: idNumber || null,
      outstation,
      roles,
      status: 'active',
      paidCash: paidCash === true,
      registrationFee: 100,
      photo: null,
      pairId: null,
      pairName: null,
      pairPartnerId: null,
      lastCheckIn: null,
      checkInHistory: [],
      weeksMissed: 0,
      complianceScore: 100,
      documents: {
        nationalId: null,
        baptismCard: null,
        approvalStatus: 'none'
      },
      twoFactorEnabled: false,
      whatsappRegistered: false,
      createdAt: new Date(),
      __v: 0
    });

    const memberNumber = totalUsers + 1;

    // Welcome in-app notification
    await db.collection('notifications').insertOne({
      id: Date.now().toString(),
      title: '🎉 Welcome to Forge Youth!',
      message: `You are member #${memberNumber}. Your outstation: ${outstation}. Next: your Moderator will pair you with a Jozi partner. Register for the next mass and complete your registration fee (KES 100).`,
      type: 'welcome',
      userId: result.insertedId.toString(),
      timestamp: new Date(),
      read: false
    });

    // Notify moderators about new registration
    const moderators = await db.collection('users').find({
      roles: { $in: ['moderator', 'father'] }
    }).toArray();

    for (const mod of moderators) {
      await db.collection('notifications').insertOne({
        id: Date.now().toString() + Math.random(),
        title: '👤 New Member Registered',
        message: `${fullName} (${formattedPhone}) joined from ${outstation} outstation. Total: ${memberNumber}.`,
        type: 'member',
        userId: mod._id.toString(),
        timestamp: new Date(),
        read: false
      });
    }

    // Audit log
    try {
      await db.collection('audit_logs').insertOne({
        action: 'register_member',
        performedBy: result.insertedId.toString(),
        performedByName: fullName,
        targetUser: result.insertedId.toString(),
        targetUserName: fullName,
        details: `Registered as ${roles.join(', ')} in ${outstation}`,
        hash: 'pending',
        previousHash: 'GENESIS',
        timestamp: new Date()
      });
    } catch (e) {}

    return NextResponse.json({
      message: roles.includes('father')
        ? "Welcome! You are the founding admin."
        : "Welcome to Forge Youth! Check your notifications.",
      userId: result.insertedId.toString(),
      roles,
      memberNumber
    });

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
