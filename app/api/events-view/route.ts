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

export async function GET(req: NextRequest) {
  try {
    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const sort = req.nextUrl.searchParams.get("sort") || "newest";

    const sortOrder = sort === "oldest" ? 1 : -1;

    const events = await db.collection('events')
      .find({})
      .sort({ date: sortOrder })
      .toArray();

    // Link frago + budgets to each event
    const result = await Promise.all(events.map(async (e: any) => {
      const eventIdStr = e._id.toString();

      let frago = null;
      try {
        frago = await db.collection('fragos').findOne({ eventId: eventIdStr });
      } catch (err) {}

      let budget = null;
      try {
        budget = await db.collection('budgets').findOne({ eventId: eventIdStr });
      } catch (err) {}

      // Calculate expenditure from transactions linked to this event
      let expenditure = 0;
      try {
        const txs = await db.collection('transactions').find({ eventId: e._id }).toArray();
        expenditure = txs.reduce((s: number, t: any) => s + (t.amount || 0), 0);
      } catch (err) {}

      return {
        _id: eventIdStr,
        title: e.title,
        date: e.date,
        time: e.time || null,
        venue: e.venue,
        description: e.description || null,
        ticketPrice: e.ticketPrice || 0,
        status: e.status || 'upcoming',
        hasFrago: !!frago,
        fragoStatus: frago?.status || null,
        hasBudget: !!budget,
        budgetTotal: budget?.totalAmount || 0,
        budgetStatus: budget?.status || null,
        expenditure
      };
    }));

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
