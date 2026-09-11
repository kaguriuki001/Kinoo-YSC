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

export async function POST(req: NextRequest) {
  try {
    const { confirm, scope, adminPhone } = await req.json();

    if (confirm !== "RESET") {
      return NextResponse.json({ error: "Type RESET to confirm" }, { status: 400 });
    }

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const results: any = {};

    if (scope === 'all') {
      const adminFilter = adminPhone
        ? { phone: adminPhone }
        : { $or: [{ roles: 'father' }, { roles: 'moderator' }] };

      const adminUsers = await db.collection('users').find(adminFilter).toArray();
      const adminIds = adminUsers.map((u: any) => u._id);

      const userRes = await db.collection('users').deleteMany({ _id: { $nin: adminIds } });
      results.usersDeleted = userRes.deletedCount;

      const txRes = await db.collection('transactions').deleteMany({});
      results.transactionsDeleted = txRes.deletedCount;

      const evRes = await db.collection('events').deleteMany({});
      results.eventsDeleted = evRes.deletedCount;

      const frRes = await db.collection('fragos').deleteMany({});
      results.fragosDeleted = frRes.deletedCount;

      const buRes = await db.collection('budgets').deleteMany({});
      results.budgetsDeleted = buRes.deletedCount;

      const noRes = await db.collection('notifications').deleteMany({});
      results.notificationsDeleted = noRes.deletedCount;

      const atRes = await db.collection('attendance').deleteMany({});
      results.attendanceDeleted = atRes.deletedCount;

      await db.collection('password_resets').deleteMany({});
      await db.collection('minutes').deleteMany({});
      await db.collection('subcommittees').deleteMany({});
    }

    if (scope === 'transactions') {
      const r = await db.collection('transactions').deleteMany({});
      results.transactionsDeleted = r.deletedCount;
    }

    if (scope === 'events') {
      const r = await db.collection('events').deleteMany({});
      results.eventsDeleted = r.deletedCount;
    }

    if (scope === 'fragos') {
      const r = await db.collection('fragos').deleteMany({});
      results.fragosDeleted = r.deletedCount;
    }

    if (scope === 'notifications') {
      const r = await db.collection('notifications').deleteMany({});
      results.notificationsDeleted = r.deletedCount;
    }

    return NextResponse.json({ message: "Reset complete", results });
  } catch (error: any) {
    console.error("Reset error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}