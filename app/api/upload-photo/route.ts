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

export async function POST(req: NextRequest) {
  try {
    const { userId, photoData } = await req.json();
    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });
    if (!photoData) return NextResponse.json({ error: "Photo data required" }, { status: 400 });

    // Check size (max 2MB in base64)
    if (photoData.length > 2800000) {
      return NextResponse.json({ error: "Photo too large (max 2MB)" }, { status: 400 });
    }

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    await db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { photo: photoData, photoUpdatedAt: new Date() } }
    );

    return NextResponse.json({ message: "Photo uploaded successfully" });
  } catch (error: any) {
    console.error("Photo upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    await db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $unset: { photo: "" } }
    );

    return NextResponse.json({ message: "Photo removed" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}