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
    const users = await db.collection("users").find({}).toArray();
    const pending = [];
    for (const u of users) {
      const docs = u.documents || {};
      const docKeys = ["nationalId", "baptismCard", "photo", "kcpe", "kcse"];
      for (const key of docKeys) {
        const status = docs[key + "Status"];
        if (status === "pending" && docs[key]) {
          pending.push({
            userId: u._id.toString(),
            fullName: u.fullName,
            phone: u.phone,
            outstation: u.outstation || "-",
            docType: key,
            docData: docs[key],
            uploadedAt: docs[key + "UploadedAt"] || null
          });
        }
      }
    }
    return NextResponse.json(pending);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
