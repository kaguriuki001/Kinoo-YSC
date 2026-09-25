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
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const sort = req.nextUrl.searchParams.get("sort") || "newest";
    const userId = req.nextUrl.searchParams.get("userId");
    const sortOrder = sort === "oldest" ? 1 : -1;
    const events = await db.collection("events").find({}).sort({ date: sortOrder }).toArray();

    const result = await Promise.all(events.map(async (e: any) => {
      const eventIdStr = e._id.toString();
      let frago = null;
      try { frago = await db.collection("fragos").findOne({ eventId: eventIdStr }); } catch (err) {}
      let budget = null;
      try { budget = await db.collection("budgets").findOne({ eventId: eventIdStr }); } catch (err) {}
      let expenditure = 0;
      try {
        const txs = await db.collection("transactions").find({ eventId: e._id }).toArray();
        expenditure = txs.reduce((s: number, t: any) => s + (t.amount || 0), 0);
      } catch (err) {}

      let alreadyCheckedIn = false;
      let attendanceCount = 0;
      try {
        attendanceCount = await db.collection("attendance").countDocuments({ eventId: e._id });
        if (userId) {
          const existing = await db.collection("attendance").findOne({
            eventId: e._id,
            memberId: new mongoose.Types.ObjectId(userId)
          });
          alreadyCheckedIn = !!existing;
        }
      } catch (err) {}

      const eventDate = new Date(e.date);
      const isToday = eventDate.toDateString() === new Date().toDateString();
      const canCheckIn = e.status !== "completed" && !alreadyCheckedIn;

      return {
        _id: eventIdStr,
        title: e.title,
        date: e.date,
        time: e.time || null,
        venue: e.venue,
        description: e.description || null,
        ticketPrice: e.ticketPrice || 0,
        status: e.status || "upcoming",
        hasFrago: !!frago,
        fragoStatus: frago?.status || null,
        hasBudget: !!budget,
        budgetTotal: budget?.totalAmount || 0,
        budgetStatus: budget?.status || null,
        expenditure,
        alreadyCheckedIn,
        attendanceCount,
        isToday,
        canCheckIn
      };
    }));

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
