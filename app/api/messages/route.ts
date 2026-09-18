import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { pusherServer } from "@/lib/pusher";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (!MONGODB_URI) throw new Error("MONGODB_URI missing");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const conversationId = req.nextUrl.searchParams.get("conversationId");
    if (!conversationId) return NextResponse.json({ error: "conversationId required" }, { status: 400 });

    const messages = await db.collection('messages').find({ conversationId }).sort({ createdAt: 1 }).limit(200).toArray();
    const result = messages.map((m: any) => ({
      _id: m._id.toString(),
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: m.senderName,
      text: m.text,
      attachments: m.attachments || [],
      readBy: m.readBy || [],
      createdAt: m.createdAt
    }));
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { conversationId, senderId, senderName, text, attachments } = await req.json();
    if (!conversationId || !senderId || !text) {
      return NextResponse.json({ error: "conversationId, senderId, and text required" }, { status: 400 });
    }

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const message = {
      conversationId,
      senderId,
      senderName,
      text,
      attachments: attachments || [],
      readBy: [senderId],
      createdAt: new Date(),
      __v: 0
    };
    const result = await db.collection('messages').insertOne(message);

    await db.collection('conversations').updateOne(
      { conversationId },
      {
        $set: { lastMessage: text.substring(0, 60), lastMessageAt: new Date(), lastSender: senderName },
        $setOnInsert: { conversationId, createdAt: new Date() }
      },
      { upsert: true }
    );

    try {
      await pusherServer.trigger(`conversation-${conversationId}`, "new-message", { _id: result.insertedId.toString(), ...message });
    } catch (e) { console.error("Pusher failed:", e); }

    try {
      const conversation = await db.collection('conversations').findOne({ conversationId });
      const participantIds = conversation?.participantIds || [];
      const notifDocs = participantIds.filter((id: string) => id !== senderId).map((id: string) => ({
        id: Date.now().toString() + Math.random(),
        title: `New message from ${senderName}`,
        message: text.substring(0, 80),
        type: 'message',
        userId: id,
        conversationId,
        timestamp: new Date(),
        read: false
      }));
      if (notifDocs.length > 0) await db.collection('notifications').insertMany(notifDocs);
    } catch (e) {}

    return NextResponse.json({ message: "Sent", id: result.insertedId.toString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { messageId, userId } = await req.json();
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    await db.collection('messages').updateOne(
      { _id: new mongoose.Types.ObjectId(messageId) },
      { $addToSet: { readBy: userId } }
    );
    return NextResponse.json({ message: "Marked read" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
