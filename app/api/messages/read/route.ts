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
    const { conversationId, userId } = await req.json();
    if (!conversationId || !userId) {
      return NextResponse.json({ error: "conversationId and userId required" }, { status: 400 });
    }
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    await db.collection("messages").updateMany(
      { conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
    return NextResponse.json({ message: "Marked as read" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
