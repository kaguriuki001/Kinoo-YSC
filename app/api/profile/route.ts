import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
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
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const user = await db.collection("users").findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      _id: user._id.toString(),
      fullName: user.fullName,
      phone: user.phone,
      roles: user.roles,
      outstation: user.outstation,
      photo: user.photo || null,
      coverPhoto: user.coverPhoto || null,
      bio: user.bio || "",
      pairName: user.pairName || null,
      checkInCount: (user.checkInHistory || []).length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, photo, coverPhoto, bio } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const update: any = {};
    if (photo !== undefined) update.photo = photo;
    if (coverPhoto !== undefined) update.coverPhoto = coverPhoto;
    if (bio !== undefined) update.bio = bio;
    await db.collection("users").updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: update }
    );
    return NextResponse.json({ message: "Profile updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
