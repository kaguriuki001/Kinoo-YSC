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
    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const userId = req.nextUrl.searchParams.get("userId");
    const query = userId ? { fromUser: new mongoose.Types.ObjectId(userId) } : {};

    const txs = await db.collection('transactions')
      .find(query)
      .sort({ date: -1 })
      .limit(50)
      .toArray();

    const result = txs.map((t: any) => ({
      _id: t._id.toString(),
      amount: t.amount,
      purpose: t.purpose,
      type: t.type || 'income',
      verified: t.verified !== false,
      mpesaReceipt: t.mpesaReceipt || null,
      date: t.date,
      fromUser: t.fromUser ? t.fromUser.toString() : null
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
    const { amount, purpose, memberId } = await req.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const result = await db.collection('transactions').insertOne({
      amount: Number(amount),
      purpose: purpose || 'Contribution',
      type: 'income',
      fromUser: memberId ? new mongoose.Types.ObjectId(memberId) : null,
      verified: false,
      mpesaReceipt: null,
      date: new Date(),
      __v: 0
    });

    return NextResponse.json({
      message: "Contribution logged",
      id: result.insertedId.toString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
