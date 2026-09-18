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
    const { name, participantIds, creatorId } = await req.json();
    if (!name || !participantIds || participantIds.length < 2) {
      return NextResponse.json({ error: "Name and at least 2 members required" }, { status: 400 });
    }
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const allParticipants = [...new Set([...participantIds, creatorId])];
    const conversationId = "grp_" + Date.now();
    await db.collection("conversations").insertOne({
      conversationId,
      type: "group",
      name,
      participantIds: allParticipants,
      createdBy: creatorId,
      lastMessageAt: new Date(),
      createdAt: new Date(),
      __v: 0
    });
    return NextResponse.json({ conversationId, message: "Group created" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
