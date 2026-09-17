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

export async function GET() {
  try {
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const subs = await db.collection('subcommittees').find({}).sort({ createdAt: -1 }).toArray();

    const result = await Promise.all(subs.map(async (s: any) => {
      let chair = null, secretary = null;
      const memberIds = s.memberIds || [];

      try {
        if (s.chairId) chair = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(s.chairId) });
        if (s.secretaryId) secretary = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(s.secretaryId) });
      } catch (e) {}

      return {
        _id: s._id.toString(),
        name: s.name,
        purpose: s.purpose || '',
        chairUserId: chair ? { _id: chair._id.toString(), fullName: chair.fullName } : null,
        secretaryUserId: secretary ? { _id: secretary._id.toString(), fullName: secretary.fullName } : null,
        members: memberIds.map((id: string) => ({ _id: id })),
        memberCount: memberIds.length,
        createdAt: s.createdAt
      };
    }));

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, purpose, chairId, secretaryId, memberIds } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Subcommittee name required" }, { status: 400 });
    }

    if (!chairId) {
      return NextResponse.json({ error: "Chair must be selected" }, { status: 400 });
    }

    if (!secretaryId) {
      return NextResponse.json({ error: "Secretary must be selected" }, { status: 400 });
    }

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const existing = await db.collection('subcommittees').findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json({ error: "A subcommittee with this name already exists" }, { status: 400 });
    }

    const chair = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(chairId) });
    const secretary = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(secretaryId) });
    if (!chair) return NextResponse.json({ error: "Chair user not found" }, { status: 404 });
    if (!secretary) return NextResponse.json({ error: "Secretary user not found" }, { status: 404 });

    const result = await db.collection('subcommittees').insertOne({
      name: name.trim(),
      purpose: purpose || '',
      chairId,
      secretaryId,
      memberIds: memberIds || [],
      createdAt: new Date(),
      createdBy: null,
      __v: 0
    });

    return NextResponse.json({
      message: "Subcommittee created successfully",
      id: result.insertedId.toString(),
      subcommittee: {
        _id: result.insertedId.toString(),
        name: name.trim(),
        chairUserId: { _id: chairId, fullName: chair.fullName },
        secretaryUserId: { _id: secretaryId, fullName: secretary.fullName },
        memberCount: (memberIds || []).length
      }
    });

  } catch (error: any) {
    console.error("Subcommittee creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    await db.collection('subcommittees').deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
