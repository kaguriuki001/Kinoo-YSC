import { NextRequest, NextResponse } from "next/server";
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
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const q = query.toLowerCase();
    const title = "Here is what I found:";
    const lines: string[] = [];

    if (q.includes("member") || q.includes("how many")) {
      const total = await db.collection("users").countDocuments();
      const active = await db.collection("users").countDocuments({ status: "active" });
      const pending = await db.collection("users").countDocuments({ status: "pending" });
      lines.push("👥 Total members: " + total);
      lines.push("✅ Active: " + active);
      lines.push("⏳ Pending: " + pending);
    }

    if (q.includes("money") || q.includes("balance") || q.includes("finance") || q.includes("income") || q.includes("expense")) {
      const txs = await db.collection("transactions").find({}).toArray();
      const income = txs.filter((t: any) => t.type !== "expense" && t.verified).reduce((s: number, t: any) => s + (t.amount || 0), 0);
      const expenses = txs.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + (t.amount || 0), 0);
      lines.push("💰 Income: KES " + income.toLocaleString());
      lines.push("💸 Expenses: KES " + expenses.toLocaleString());
      lines.push("📊 Balance: KES " + (income - expenses).toLocaleString());
    }

    if (q.includes("event")) {
      const events = await db.collection("events").find({}).toArray();
      const upcoming = events.filter((e: any) => new Date(e.date) >= new Date());
      lines.push("📅 Total events: " + events.length);
      lines.push("🎯 Upcoming: " + upcoming.length);
      if (upcoming.length > 0) {
        lines.push("🔜 Next: " + upcoming[0].title + " on " + new Date(upcoming[0].date).toDateString());
      }
    }

    if (q.includes("attendance") || q.includes("check-in")) {
      const attendance = await db.collection("attendance").find({}).toArray();
      lines.push("✅ Total check-ins: " + attendance.length);
    }

    if (q.includes("frago") || q.includes("trip")) {
      const fragos = await db.collection("fragos").find({}).toArray();
      lines.push("🎯 Total FRAGOs: " + fragos.length);
    }

    if (q.includes("pair") || q.includes("jozi")) {
      const pairs = await db.collection("pairs").find({}).toArray();
      const unpaired = await db.collection("users").countDocuments({ status: "active", pairId: null });
      lines.push("🤝 Pairs formed: " + pairs.length);
      lines.push("⚠️ Unpaired members: " + unpaired);
    }

    if (q.includes("suggest") || q.includes("advice") || q.includes("recommend") || q.includes("strategy")) {
      const active = await db.collection("users").countDocuments({ status: "active" });
      const txs = await db.collection("transactions").find({ verified: true }).toArray();
      const income = txs.filter((t: any) => t.type !== "expense").reduce((s: number, t: any) => s + (t.amount || 0), 0);
      lines.push("💡 Strategic recommendations:");
      if (active < 30) lines.push("📈 Growth: You have " + active + " active members — start a recruitment drive.");
      if (income < 50000) lines.push("💰 Finance: Income is KES " + income.toLocaleString() + " — encourage contributions.");
      lines.push("🔔 Engagement: Send weekly check-in reminders.");
      lines.push("📅 Events: Plan 2-3 activities per quarter.");
    }

    if (lines.length === 0) {
      lines.push("I did not understand. Try asking:");
      lines.push("• How many members do we have?");
      lines.push("• What is our financial status?");
      lines.push("• Show me upcoming events");
      lines.push("• Suggest strategies");
    }

    return NextResponse.json({ title, lines });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
