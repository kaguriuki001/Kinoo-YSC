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

export async function PATCH(req: NextRequest) {
  try {
    const { feedbackId, includeInFrago, eventId } = await req.json();

    if (!feedbackId || !eventId) {
      return NextResponse.json({ error: "feedbackId and eventId required" }, { status: 400 });
    }

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    await db.collection('event_feedback').updateOne(
      { _id: new mongoose.Types.ObjectId(feedbackId) },
      { $set: { includeInFrago: includeInFrago === true, curatedAt: new Date() } }
    );

    return NextResponse.json({ message: "Feedback updated", includeInFrago });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
