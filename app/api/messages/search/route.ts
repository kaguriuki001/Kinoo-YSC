import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

export async function GET(req: NextRequest) {
  try {
    const conversationId = req.nextUrl.searchParams.get("conversationId");
    const query = req.nextUrl.searchParams.get("q");
    if (!conversationId || !query) {
      return NextResponse.json({ error: "conversationId and q required" }, { status: 400 });
    }
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const results = await db.collection("messages")
      .find({ conversationId, text: { $regex: query, $options: "i" } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    return NextResponse.json(results.map((m: any) => ({
      _id: m._id.toString(),
      senderName: m.senderName,
      text: m.text,
      createdAt: m.createdAt
    })));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
