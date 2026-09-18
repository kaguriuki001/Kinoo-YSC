import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
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
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const conversations = await db.collection('conversations').find({ participantIds: userId }).sort({ lastMessageAt: -1 }).toArray();

    const result = await Promise.all(conversations.map(async (c: any) => {
      const otherIds = (c.participantIds || []).filter((id: string) => id !== userId);
      let displayName = c.name || 'Chat';
      if (!c.name && otherIds.length > 0) {
        try {
          const other = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(otherIds[0]) });
          displayName = other?.fullName || 'Chat';
        } catch (e) {}
      }
      let unread = 0;
      try {
        unread = await db.collection('messages').countDocuments({ conversationId: c.conversationId, readBy: { $ne: userId } });
      } catch (e) {}
      return {
        conversationId: c.conversationId,
        name: displayName,
        type: c.type || 'direct',
        lastMessage: c.lastMessage || '',
        lastMessageAt: c.lastMessageAt || c.createdAt,
        unread
      };
    }));

    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, otherUserId, type, name, participantIds } = await req.json();
    const db = await getDB();
    if (!db) throw new Error("DB failed");

    let conversationId: string;
    let participants: string[] = [];
    let conversationName = name || null;
    let conversationType = type || 'direct';

    if (conversationType === 'direct' && otherUserId) {
      const existing = await db.collection('conversations').findOne({ type: 'direct', participantIds: { $all: [userId, otherUserId] } });
      if (existing) return NextResponse.json({ conversationId: existing.conversationId, existing: true });
      participants = [userId, otherUserId];
      conversationId = 'conv_' + [userId, otherUserId].sort().join('_');
    } else if (conversationType === 'group' && participantIds) {
      participants = participantIds;
      conversationId = 'grp_' + Date.now();
    } else if (conversationType === 'broadcast') {
      const all = await db.collection('users').find({ status: 'active' }).toArray();
      participants = all.map((u: any) => u._id.toString());
      conversationId = 'broadcast_all';
      conversationName = name || 'Broadcast to All';
    } else {
      return NextResponse.json({ error: "Invalid conversation" }, { status: 400 });
    }

    await db.collection('conversations').updateOne(
      { conversationId },
      {
        $set: { conversationId, type: conversationType, name: conversationName, participantIds: participants, lastMessageAt: new Date() },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    return NextResponse.json({ conversationId, existing: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
