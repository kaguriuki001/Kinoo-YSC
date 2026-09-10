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
    const quarter = req.nextUrl.searchParams.get("quarter");
    if (!quarter) return NextResponse.json({ error: "Quarter required (e.g., 2026-Q1)" }, { status: 400 });

    const [year, q] = quarter.split('-Q');
    const qNum = parseInt(q);
    if (isNaN(qNum) || qNum < 1 || qNum > 4) return NextResponse.json({ error: "Invalid quarter" }, { status: 400 });

    const startMonth = (qNum - 1) * 3;
    const start = new Date(parseInt(year), startMonth, 1);
    const end = new Date(parseInt(year), startMonth + 3, 0, 23, 59, 59);

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const fragos = await db.collection('fragos').find({ createdAt: { $gte: start, $lte: end } }).toArray();

    const totalEvents = fragos.length;
    const totalAttendees = fragos.reduce((s: number, f: any) => s + (f.attendees?.length || 0), 0);
    const totalBudget = fragos.reduce((s: number, f: any) => s + (f.budget || []).reduce((bs: number, b: any) => bs + (parseFloat(b.amount) || 0), 0), 0);
    const totalActual = fragos.reduce((s: number, f: any) => s + (f.reconciliation || []).reduce((rs: number, r: any) => rs + (parseFloat(r.actual) || 0), 0), 0);

    const verdicts = {
      successful: fragos.filter((f: any) => f.verdict === 'Successful').length,
      mixed: fragos.filter((f: any) => f.verdict === 'Mixed').length,
      needsImprovement: fragos.filter((f: any) => f.verdict === 'Needs Improvement').length,
    };

    return NextResponse.json({
      quarter, startDate: start, endDate: end,
      totalEvents, totalAttendees, totalBudget, totalActual,
      totalVariance: totalBudget - totalActual,
      verdicts,
      fragos: fragos.map((f: any) => ({
        id: f._id.toString(),
        opName: f.opName,
        date: f.createdAt,
        attendees: f.attendees?.length || 0,
        budget: (f.budget || []).reduce((s: number, b: any) => s + (parseFloat(b.amount) || 0), 0),
        actual: (f.reconciliation || []).reduce((s: number, r: any) => s + (parseFloat(r.actual) || 0), 0),
        verdict: f.verdict || 'N/A',
        status: f.status
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}