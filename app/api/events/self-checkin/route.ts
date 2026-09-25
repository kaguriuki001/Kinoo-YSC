import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

export async function POST(req: NextRequest) {
  try {
    const { eventId, userId } = await req.json();
    if (!eventId || !userId) {
      return NextResponse.json({ error: "eventId and userId required" }, { status: 400 });
    }
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const existing = await db.collection("attendance").findOne({
      eventId: new mongoose.Types.ObjectId(eventId),
      memberId: new mongoose.Types.ObjectId(userId)
    });
    if (existing) {
      return NextResponse.json({ message: "Already checked in", already: true });
    }
    await db.collection("attendance").insertOne({
      eventId: new mongoose.Types.ObjectId(eventId),
      memberId: new mongoose.Types.ObjectId(userId),
      status: "present",
      selfCheckIn: true,
      date: new Date(),
      __v: 0
    });
    try {
      const event = await db.collection("events").findOne({ _id: new mongoose.Types.ObjectId(eventId) });
      const user = await db.collection("users").findOne({ _id: new mongoose.Types.ObjectId(userId) });
      const admins = await db.collection("users").find({
        roles: { $in: ["organizing_secretary", "moderator", "father"] }
      }).toArray();
      const notifs = admins.map((a: any) => ({
        id: Date.now().toString() + Math.random(),
        title: "Self Check-in",
        message: (user?.fullName || "A member") + " checked in at " + (event?.title || "event"),
        type: "attendance",
        userId: a._id.toString(),
        timestamp: new Date(),
        read: false
      }));
      if (notifs.length > 0) await db.collection("notifications").insertMany(notifs);
    } catch (e) {}
    return NextResponse.json({ message: "Checked in successfully!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
