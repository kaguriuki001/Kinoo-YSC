import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

const DEFAULT_REQUIREMENTS = [
  { key: "nationalId", label: "National ID", icon: "🆔", mode: "required" },
  { key: "baptismCard", label: "Baptism Card", icon: "📜", mode: "required" },
  { key: "photo", label: "Profile Photo", icon: "📸", mode: "optional" },
  { key: "kcpe", label: "KCPE Certificate", icon: "🎓", mode: "optional" },
  { key: "kcse", label: "KCSE Certificate", icon: "🎓", mode: "hidden" }
];

export async function GET() {
  try {
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const settings = await db.collection("settings").findOne({ key: "doc_requirements" });
    return NextResponse.json({ requirements: settings?.requirements || DEFAULT_REQUIREMENTS });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { requirements } = await req.json();
    if (!Array.isArray(requirements)) {
      return NextResponse.json({ error: "requirements array required" }, { status: 400 });
    }
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    await db.collection("settings").updateOne(
      { key: "doc_requirements" },
      { $set: { key: "doc_requirements", requirements, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ message: "Requirements updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
