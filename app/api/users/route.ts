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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const showDismissed = req.nextUrl.searchParams.get("includeDismissed") === "true";
    const query = showDismissed ? {} : { status: { $ne: 'dismissed' } };

    const users = await db.collection('users')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const result = users.map((u: any) => ({
      _id: u._id.toString(),
      fullName: u.fullName,
      phone: u.phone,
      roles: u.roles || [],
      status: u.status,
      photo: u.photo || null,
      idNumber: u.idNumber || null,
      pairId: u.pairId || null,
      outstation: u.outstation || null,
      createdAt: u.createdAt
    }));

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
