import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

async function getDB() {
  const uri = process.env.MONGODB_URI || "";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

const DEFAULTS = {
  diocese: "Catholic Diocese of Nairobi",
  deanery: "Kinoo Deanery",
  parish: "Kinoo Parish",
  outstations: ["Uthiru", "Kagondo", "Kinoo"],
  council: []
};

export async function GET() {
  try {
    const db = await getDB();
    if (!db) throw new Error("DB unavailable");
    const doc = await db.collection("settings").findOne({ key: "scope_hierarchy" });
    const stored = (doc && doc.hierarchy) || {};
    return NextResponse.json({
      hierarchy: Object.assign({}, DEFAULTS, stored, { council: stored.council || [] })
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hierarchy = body.hierarchy;
    if (!hierarchy || typeof hierarchy !== "object") {
      return NextResponse.json({ error: "hierarchy required" }, { status: 400 });
    }
    const db = await getDB();
    if (!db) throw new Error("DB unavailable");
    await db.collection("settings").updateOne(
      { key: "scope_hierarchy" },
      { $set: { key: "scope_hierarchy", hierarchy: hierarchy, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ message: "Saved" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
