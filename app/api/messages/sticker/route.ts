import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { pusherServer } from "@/lib/pusher";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

export async function POST(req: NextRequest) {
  try {
    const { conversationId, senderId, senderName, sticker, stickerType } = await req.json();
    if (!conversationId || !senderId || !sticker) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const message = {
      conversationId,
      senderId,
      senderName,
      text: "",
      stickers: [{ content: sticker, type: stickerType || "emoji" }],
      readBy: [senderId],
      createdAt: new Date(),
      __v: 0
    };
    const result = await db.collection("messages").insertOne(message);
    await db.collection("conversations").updateOne(
      { conversationId },
      { $set: { lastMessage: stickerType === "gif" ? "GIF" : sticker, lastMessageAt: new Date() } }
    );
    try {
      await pusherServer.trigger("conversation-" + conversationId, "new-message", { _id: result.insertedId.toString(), ...message });
    } catch (e) {}
    return NextResponse.json({ message: "Sent", id: result.insertedId.toString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
