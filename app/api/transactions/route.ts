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
    if (!db) throw new Error("DB connection failed");

    const transactions = await db.collection('transactions').find({}).sort({ date: -1 }).toArray();

    // Populate fromUser manually
    const userIds = transactions.map((t: any) => t.fromUser).filter(Boolean);
    const users = userIds.length > 0 
      ? await db.collection('users').find({ _id: { $in: userIds } }).toArray()
      : [];
    
    const userMap: Record<string, any> = {};
    users.forEach((u: any) => { userMap[u._id.toString()] = { fullName: u.fullName, phone: u.phone }; });

    const result = transactions.map((t: any) => ({
      _id: t._id.toString(),
      amount: t.amount,
      purpose: t.purpose,
      type: t.type || 'income',
      description: t.description || '',
      verified: t.verified !== false,
      date: t.date,
      fromUser: t.fromUser ? userMap[t.fromUser.toString()] || null : null
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET transactions error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, purpose, type, description, memberId } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!purpose) {
      return NextResponse.json({ error: "Purpose required" }, { status: 400 });
    }

    const db = await getDB();
    if (!db) throw new Error("DB connection failed");

    const result = await db.collection('transactions').insertOne({
      amount: Number(amount),
      purpose,
      type: type || 'income',
      description: description || '',
      fromUser: memberId ? new mongoose.Types.ObjectId(memberId) : null,
      verified: true,
      date: new Date(),
      __v: 0
    });

    return NextResponse.json({ message: "Transaction added", id: result.insertedId });
  } catch (error: any) {
    console.error("POST transaction error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}