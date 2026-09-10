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
    const budgets = await db.collection('budgets').find({}).sort({ createdAt: -1 }).toArray();
    const result = budgets.map((b: any) => ({
      _id: b._id.toString(),
      title: b.title,
      items: b.items || [],
      totalAmount: b.totalAmount || 0,
      status: b.status || 'draft',
      createdAt: b.createdAt
    }));
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET budgets error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, items, totalAmount, status } = body;

    if (!title || !items || items.length === 0) {
      return NextResponse.json({ error: "Title and items required" }, { status: 400 });
    }

    const db = await getDB();
    if (!db) throw new Error("DB connection failed");

    const calculatedTotal = Number(totalAmount) || items.reduce((s: number, i: any) => s + (Number(i.estimatedCost) || 0), 0);

    const result = await db.collection('budgets').insertOne({
      title,
      items: items.map((i: any) => ({ name: i.name, estimatedCost: Number(i.estimatedCost) || 0, actualCost: 0 })),
      totalAmount: calculatedTotal,
      status: status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    });

    return NextResponse.json({ message: "Budget created", id: result.insertedId });
  } catch (error: any) {
    console.error("POST budget error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status required" }, { status: 400 });
    }

    const db = await getDB();
    if (!db) throw new Error("DB connection failed");

    await db.collection('budgets').updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    return NextResponse.json({ message: "Budget updated" });
  } catch (error: any) {
    console.error("PATCH budget error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}