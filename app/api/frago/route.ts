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

export async function GET(req: NextRequest) {
  try {
    const eventId = req.nextUrl.searchParams.get("eventId");
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    let query: any = {};
    if (eventId) query.eventId = new mongoose.Types.ObjectId(eventId);
    const fragos = await db.collection('fragos').find(query).sort({ createdAt: -1 }).toArray();
    const result = fragos.map((f: any) => ({ ...f, _id: f._id.toString() }));
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const signatures = body.signatures || {};
    const signedCount = ['moderator', 'fic', 'treasurer'].filter(k => signatures[k]).length;

    if ((body.status === 'approved' || body.status === 'completed') && signedCount < 2) {
      return NextResponse.json({ error: "At least 2 signatures required (Moderator + FIC)" }, { status: 400 });
    }

    if (body._id) {
      const id = body._id;
      const oldFrago = await db.collection('fragos').findOne({ _id: new mongoose.Types.ObjectId(id) });
      delete body._id;

      await db.collection('fragos').updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { ...body, updatedAt: new Date() } }
      );

      const members = await db.collection('users').find({ status: 'active' }).toArray();
      const notificationDocs = members.map((m: any) => ({
        id: Date.now().toString() + Math.random(),
        title: "FRAGO Updated",
        message: `${body.opName || oldFrago?.opName} has been updated`,
        type: 'frago',
        userId: m._id.toString(),
        timestamp: new Date(),
        read: false
      }));
      if (notificationDocs.length > 0) {
        await db.collection('notifications').insertMany(notificationDocs);
      }

      return NextResponse.json({ message: "FRAGO updated", id });
    }

    const result = await db.collection('fragos').insertOne({
      ...body,
      status: body.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    });

    const members = await db.collection('users').find({ status: 'active' }).toArray();
    const notificationDocs = members.map((m: any) => ({
      id: Date.now().toString() + Math.random(),
      title: "New FRAGO Created",
      message: `${body.opName || 'New FRAGO'} has been created`,
      type: 'frago',
      userId: m._id.toString(),
      timestamp: new Date(),
      read: false
    }));
    if (notificationDocs.length > 0) {
      await db.collection('notifications').insertMany(notificationDocs);
    }

    return NextResponse.json({ message: "FRAGO created", id: result.insertedId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    await db.collection('fragos').deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    return NextResponse.json({ message: "FRAGO deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}