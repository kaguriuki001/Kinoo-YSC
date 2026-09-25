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
    return NextResponse.json(user?.documents || {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, docType, docData } = await req.json();
    if (!userId || !docType || !docData) {
      return NextResponse.json({ error: "userId, docType, and docData required" }, { status: 400 });
    }
    if (docData.length > 3000000) {
      return NextResponse.json({ error: "Document too large (max 2MB)" }, { status: 400 });
    }
    const validTypes = ["nationalId", "baptismCard", "photo", "kcpe", "kcse"];
    if (!validTypes.includes(docType)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const updateField = "documents." + docType;
    const updateStatus = "documents." + docType + "Status";
    const updateTime = "documents." + docType + "UploadedAt";
    await db.collection("users").updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { [updateField]: docData, [updateStatus]: "pending", [updateTime]: new Date() } }
    );
    return NextResponse.json({ message: "Document uploaded", status: "pending" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId, docType, status, approvedBy } = await req.json();
    if (!userId || !docType || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const updateStatus = "documents." + docType + "Status";
    const updateApprover = "documents." + docType + "ApprovedBy";
    const updateApprovedAt = "documents." + docType + "ApprovedAt";
    await db.collection("users").updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { [updateStatus]: status, [updateApprover]: approvedBy, [updateApprovedAt]: new Date() } }
    );
    return NextResponse.json({ message: "Document " + status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
