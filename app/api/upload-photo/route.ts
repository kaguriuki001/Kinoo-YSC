import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, photoData } = await req.json();
    if (!userId || !photoData) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    await db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { photo: photoData } }
    );

    return NextResponse.json({ message: "Photo uploaded" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}