import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

export async function GET() {
  try {
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const pledges = await db.collection("pledges").find({}).toArray();
    const totalPledged = pledges.reduce((s: number, p: any) => s + (p.amount || 0), 0);
    const totalPaid = pledges.filter((p: any) => p.paid).reduce((s: number, p: any) => s + (p.amount || 0), 0);
    return NextResponse.json({ totalPledged, totalPaid, target: 600000, count: pledges.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { pledgerName, amount, phone, note } = await req.json();
    if (!pledgerName || !amount) {
      return NextResponse.json({ error: "Name and amount required" }, { status: 400 });
    }
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    await db.collection("pledges").insertOne({
      pledgerName,
      amount: Number(amount),
      phone: phone || null,
      note: note || "",
      paid: false,
      createdAt: new Date(),
      __v: 0
    });
    return NextResponse.json({ message: "Pledge recorded" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { pledgeId, paid } = await req.json();
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    await db.collection("pledges").updateOne(
      { _id: new mongoose.Types.ObjectId(pledgeId) },
      { $set: { paid: paid === true } }
    );
    return NextResponse.json({ message: "Updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
