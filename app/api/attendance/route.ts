import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (!MONGODB_URI) throw new Error("MONGODB_URI missing");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

export async function GET(req: NextRequest) {
  try {
    const db = await getDB();
    if (!db) throw new Error("DB connection failed");
    const eventId = req.nextUrl.searchParams.get("eventId");
    const query = eventId ? { eventId: new mongoose.Types.ObjectId(eventId) } : {};
    const records = await db.collection('attendance').find(query).sort({ date: -1 }).toArray();
    return NextResponse.json(records);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { eventId, memberId, status } = await req.json();
    if (!eventId || !memberId || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const db = await getDB();
    if (!db) throw new Error("DB connection failed");

    // Check if already marked
    const existing = await db.collection('attendance').findOne({
      eventId: new mongoose.Types.ObjectId(eventId),
      memberId: new mongoose.Types.ObjectId(memberId)
    });

    if (existing) {
      await db.collection('attendance').updateOne(
        { _id: existing._id },
        { $set: { status, date: new Date() } }
      );
      return NextResponse.json({ message: "Attendance updated" });
    }

    await db.collection('attendance').insertOne({
      eventId: new mongoose.Types.ObjectId(eventId),
      memberId: new mongoose.Types.ObjectId(memberId),
      status,
      date: new Date()
    });

    return NextResponse.json({ message: "Attendance saved" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}