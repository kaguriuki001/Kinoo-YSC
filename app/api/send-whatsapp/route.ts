import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage, sendBulkWhatsApp } from "@/lib/whatsapp";
import mongoose from "mongoose";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

export async function POST(req: NextRequest) {
  try {
    const { to, message, sendToAll } = await req.json();

    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    if (sendToAll) {
      // Get all active members
      const db = await getDB();
      if (!db) throw new Error("DB failed");
      const members = await db.collection('users').find({ status: 'active' }).toArray();
      const phones = members.map((m: any) => m.phone).filter(Boolean);

      if (phones.length === 0) {
        return NextResponse.json({ error: "No active members with phone numbers" }, { status: 400 });
      }

      const result = await sendBulkWhatsApp(phones, message);
      return NextResponse.json({
        message: `Sent: ${result.sent}, Failed: ${result.failed}`,
        ...result
      });
    }

    if (!to) return NextResponse.json({ error: "Recipient required" }, { status: 400 });

    const result = await sendWhatsAppMessage(to, message);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });

    return NextResponse.json({ message: "Message sent", ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}