import { NextResponse } from "next/server";
import mongoose from "mongoose";

async function getDB() {
  const uri = process.env.MONGODB_URI || "";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

export async function GET() {
  try {
    const db = await getDB();
    if (!db) throw new Error("DB unavailable");

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      members,
      outstations,
      eventsThisMonth,
      upcomingEvent,
      checkedInThisWeek,
      txsThisMonth
    ] = await Promise.all([
      db.collection("users").countDocuments({ status: "active" }),
      db.collection("users").distinct("outstation", { status: "active" }),
      db.collection("events").countDocuments({ date: { $gte: thirtyDaysAgo } }),
      db.collection("events").findOne({ date: { $gte: new Date() } }, { sort: { date: 1 } }),
      db.collection("users").countDocuments({
        checkInHistory: { $elemMatch: { checkedInAt: { $gte: sevenDaysAgo } } }
      }).catch(() => 0),
      db.collection("transactions").countDocuments({ createdAt: { $gte: thirtyDaysAgo } }).catch(() => 0)
    ]);

    return NextResponse.json({
      members,
      outstations: (outstations || []).filter(Boolean).length,
      eventsThisMonth,
      checkedInThisWeek,
      txsThisMonth,
      upcomingEvent: upcomingEvent ? {
        title: upcomingEvent.title,
        date: upcomingEvent.date,
        venue: upcomingEvent.venue || ""
      } : null
    });
  } catch (e: any) {
    return NextResponse.json({ members: 0, outstations: 0, eventsThisMonth: 0, checkedInThisWeek: 0, txsThisMonth: 0, upcomingEvent: null });
  }
}
