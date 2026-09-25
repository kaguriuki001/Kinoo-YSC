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
    const settings = await db.collection("settings").findOne({ key: "app" });
    return NextResponse.json(settings || { logoUrl: null, bgColor: null, bgImage: null, orgName: "Forge Youth" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    await db.collection("settings").updateOne(
      { key: "app" },
      { $set: { key: "app", ...body, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ message: "Settings saved" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
