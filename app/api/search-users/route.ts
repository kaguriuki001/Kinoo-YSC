import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get("q") || "").trim();
    if (q.length < 2) return NextResponse.json([]);
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const users = await db
      .collection("users")
      .find({
        $or: [
          { fullName: { $regex: safeQ, $options: "i" } },
          { phone: { $regex: safeQ, $options: "i" } },
        ],
      })
      .limit(10)
      .toArray();
    return NextResponse.json(
      users.map((u: any) => ({
        _id: u._id.toString(),
        fullName: u.fullName,
        phone: u.phone,
        roles: u.roles || [],
      }))
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
