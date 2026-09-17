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
    const query = userId ? { userId } : {};
    const notifs = await db.collection('notifications')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();
    return NextResponse.json(notifs.map((n: any) => ({ ...n, _id: n._id.toString() })), {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, title, message, type } = await req.json();
    const db = await getDB();
    if (!db) throw new Error("DB failed");

    if (userId === 'all') {
      const users = await db.collection('users').find({ status: 'active' }).toArray();
      const docs = users.map((u: any) => ({
        id: Date.now().toString() + Math.random(),
        title, message, type: type || 'general',
        userId: u._id.toString(),
        timestamp: new Date(),
        read: false
      }));
      if (docs.length > 0) await db.collection('notifications').insertMany(docs);
      return NextResponse.json({ message: `Sent to ${docs.length} members` });
    }

    await db.collection('notifications').insertOne({
      id: Date.now().toString(),
      title, message, type: type || 'general',
      userId,
      timestamp: new Date(),
      read: false
    });
    return NextResponse.json({ message: "Notification sent" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { notificationId } = await req.json();
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    await db.collection('notifications').updateOne(
      { id: notificationId },
      { $set: { read: true } }
    );
    return NextResponse.json({ message: "Marked as read" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
