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
    const pairs = await db.collection('pairs').find({}).sort({ createdAt: -1 }).toArray();

    const result = await Promise.all(pairs.map(async (p: any) => {
      const memberIds = p.memberIds || [];
      const members = await db.collection('users')
        .find({ _id: { $in: memberIds.map((id: string) => new mongoose.Types.ObjectId(id)) } })
        .project({ fullName: 1, phone: 1, outstation: 1 })
        .toArray();

      return {
        _id: p._id.toString(),
        name: p.name,
        members: members.map((m: any) => ({
          _id: m._id.toString(),
          fullName: m.fullName,
          phone: m.phone,
          outstation: m.outstation
        })),
        outstation: p.outstation || null,
        createdAt: p.createdAt
      };
    }));

    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, memberIds } = await req.json();

    if (!name || !memberIds || memberIds.length !== 2) {
      return NextResponse.json({ error: "Name and exactly 2 members required" }, { status: 400 });
    }

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    // Check if any member is already paired
    const existing = await db.collection('users').find({
      _id: { $in: memberIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
      pairId: { $ne: null }
    }).toArray();

    if (existing.length > 0) {
      return NextResponse.json({ error: `${existing[0].fullName} is already in a pair` }, { status: 400 });
    }

    const result = await db.collection('pairs').insertOne({
      name: name.trim(),
      memberIds,
      outstation: null,
      createdAt: new Date(),
      __v: 0
    });

    const pairId = result.insertedId.toString();

    // Update both members
    await db.collection('users').updateMany(
      { _id: { $in: memberIds.map((id: string) => new mongoose.Types.ObjectId(id)) } },
      {
        $set: {
          pairId,
          pairName: name.trim()
        }
      }
    );

    // Set partner IDs
    await db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(memberIds[0]) },
      { $set: { pairPartnerId: memberIds[1] } }
    );
    await db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(memberIds[1]) },
      { $set: { pairPartnerId: memberIds[0] } }
    );

    // Notify both members
    const members = await db.collection('users').find({ _id: { $in: memberIds.map((id: string) => new mongoose.Types.ObjectId(id)) } }).toArray();
    for (const m of members) {
      await db.collection('notifications').insertOne({
        id: Date.now().toString() + Math.random(),
        title: "You are now in a Pair!",
        message: `You have been paired with ${members.find(x => x._id.toString() !== m._id.toString())?.fullName}. Weekly check-in begins Sunday.`,
        type: 'pair',
        userId: m._id.toString(),
        timestamp: new Date(),
        read: false
      });
    }

    return NextResponse.json({ message: "Pair created", id: pairId });
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

    const pair = await db.collection('pairs').findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (!pair) return NextResponse.json({ error: "Pair not found" }, { status: 404 });

    // Clear member references
    await db.collection('users').updateMany(
      { _id: { $in: (pair.memberIds || []).map((mid: string) => new mongoose.Types.ObjectId(mid)) } },
      { $set: { pairId: null, pairName: null, pairPartnerId: null } }
    );

    await db.collection('pairs').deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    return NextResponse.json({ message: "Pair deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
