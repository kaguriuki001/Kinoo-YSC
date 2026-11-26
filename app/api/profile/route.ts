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
      photo: user.photo || null,
      coverPhoto: user.coverPhoto || null,
      bio: user.bio || "",
      outstation: user.outstation || null,
      pairName: user.pairName || null,
      checkInCount: user.checkInCount || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function applyUpdate(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, callerId, fullName, phone, outstation, bio, photo, coverPhoto } = body;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    if (callerId && String(callerId) !== String(userId)) {
      const caller = await db.collection("users").findOne({ _id: new mongoose.Types.ObjectId(callerId) });
      if (!caller) return NextResponse.json({ error: "Caller not found" }, { status: 403 });
      const roles: string[] = (caller.roles || []).map((r: string) => String(r).toLowerCase());
      const isAdmin = roles.some((r) => r === "father" || r === "moderator");
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Only Father and Moderator can edit other profiles" },
          { status: 403 }
        );
      }
    }

    const update: any = {};
    if (fullName !== undefined) {
      const v = String(fullName).trim();
      if (!v) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      update.fullName = v;
    }
    if (phone !== undefined) {
      const v = String(phone).trim();
      if (!v) return NextResponse.json({ error: "Phone cannot be empty" }, { status: 400 });
      const existing = await db
        .collection("users")
        .findOne({ phone: v, _id: { $ne: new mongoose.Types.ObjectId(userId) } });
      if (existing) {
        return NextResponse.json({ error: "Phone already in use by another member" }, { status: 409 });
      }
      update.phone = v;
    }
    if (outstation !== undefined) update.outstation = outstation;
    if (bio !== undefined) update.bio = bio;
    if (photo !== undefined) update.photo = photo;
    if (coverPhoto !== undefined) update.coverPhoto = coverPhoto;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await db.collection("users").updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: update }
    );

    return NextResponse.json({ message: "Profile updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return applyUpdate(req);
}

export async function PATCH(req: NextRequest) {
  return applyUpdate(req);
}
