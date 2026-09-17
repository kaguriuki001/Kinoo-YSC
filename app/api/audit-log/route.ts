import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { createHash } from "crypto";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (!MONGODB_URI) throw new Error("MONGODB_URI missing");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100");
    const action = req.nextUrl.searchParams.get("action");
    const userId = req.nextUrl.searchParams.get("userId");

    const query: any = {};
    if (action) query.action = action;
    if (userId) query.performedBy = userId;

    const logs = await db.collection('audit_logs')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    const result = logs.map((l: any) => ({
      _id: l._id.toString(),
      action: l.action,
      performedBy: l.performedBy || 'system',
      performedByName: l.performedByName || 'System',
      targetUser: l.targetUser || null,
      targetUserName: l.targetUserName || null,
      details: l.details || null,
      hash: l.hash,
      previousHash: l.previousHash,
      timestamp: l.timestamp
    }));

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, performedBy, performedByName, targetUser, targetUserName, details } = await req.json();

    if (!action) {
      return NextResponse.json({ error: "Action required" }, { status: 400 });
    }

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    // Get previous hash for chain
    const lastLog = await db.collection('audit_logs').findOne({}, { sort: { timestamp: -1 } });
    const previousHash = lastLog?.hash || 'GENESIS';

    const timestamp = new Date();
    const payload = JSON.stringify({
      action,
      performedBy: performedBy || 'system',
      targetUser: targetUser || null,
      details: details || null,
      timestamp: timestamp.toISOString()
    });

    const hash = createHash('sha256')
      .update(previousHash + payload)
      .digest('hex');

    const result = await db.collection('audit_logs').insertOne({
      action,
      performedBy: performedBy || 'system',
      performedByName: performedByName || 'System',
      targetUser: targetUser || null,
      targetUserName: targetUserName || null,
      details: details || null,
      hash,
      previousHash,
      timestamp,
      __v: 0
    });

    return NextResponse.json({
      message: "Audit logged",
      id: result.insertedId.toString(),
      hash
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
