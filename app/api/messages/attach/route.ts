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
    const { conversationId, senderId, senderName, text, attachmentData, attachmentType } = await req.json();
    if (!conversationId || !senderId) {
      return NextResponse.json({ error: "conversationId and senderId required" }, { status: 400 });
    }
    if (attachmentData && attachmentData.length > 3000000) {
      return NextResponse.json({ error: "Attachment too large (max 2MB)" }, { status: 400 });
    }
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const message = {
      conversationId,
      senderId,
      senderName,
      text: text || "",
      attachments: attachmentData ? [{ data: attachmentData, type: attachmentType || "image" }] : [],
      readBy: [senderId],
      createdAt: new Date(),
      __v: 0
    };
    const result = await db.collection("messages").insertOne(message);
    await db.collection("conversations").updateOne(
      { conversationId },
      { $set: { lastMessage: text || "📎 Attachment", lastMessageAt: new Date() } }
    );
    return NextResponse.json({ message: "Sent", id: result.insertedId.toString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
