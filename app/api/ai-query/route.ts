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
    let answer = "";

    // Members stats
    if (q.includes("member") || q.includes("how many")) {
      const total = await db.collection("users").countDocuments();
      const active = await db.collection("users").countDocuments({ status: "active" });
      const pending = await db.collection("users").countDocuments({ status: "pending" });
      answer += `You have ${total} total members. ${active} active and ${pending} pending approval.\n\n`;
    }

    // Financial stats
    if (q.includes("money") || q.includes("balance") || q.includes("finance") || q.includes("income") || q.includes("expense")) {
      const txs = await db.collection("transactions").find({}).toArray();
      const income = txs.filter((t: any) => t.type !== "expense" && t.verified).reduce((s: number, t: any) => s + (t.amount || 0), 0);
      const expenses = txs.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + (t.amount || 0), 0);
      answer += `Financial status:\n• Total income: KES ${income.toLocaleString()}\n• Total expenses: KES ${expenses.toLocaleString()}\n• Balance: KES ${(income - expenses).toLocaleString()}\n\n`;
    }

    // Event stats
    if (q.includes("event")) {
      const events = await db.collection("events").find({}).toArray();
      const upcoming = events.filter((e: any) => new Date(e.date) >= new Date());
      answer += `Events:\n• Total: ${events.length}\n• Upcoming: ${upcoming.length}\n`;
      if (upcoming.length > 0) {
        answer += "• Next: " + upcoming[0].title + " on " + new Date(upcoming[0].date).toDateString() + "\n";
      }
      answer += "\n";
    }

    // Attendance stats
    if (q.includes("attendance") || q.includes("check-in")) {
      const attendance = await db.collection("attendance").find({}).toArray();
      answer += `Attendance: ${attendance.length} total check-ins recorded.\n\n`;
    }

    // Frago stats
    if (q.includes("frago") || q.includes("trip")) {
      const fragos = await db.collection("fragos").find({}).toArray();
      answer += `FRAGOs: ${fragos.length} recorded.\n\n`;
    }

    // Pair stats
    if (q.includes("pair") || q.includes("jozi")) {
      const pairs = await db.collection("pairs").find({}).toArray();
      const unpaired = await db.collection("users").countDocuments({ status: "active", pairId: null });
      answer += `Pair system: ${pairs.length} pairs formed. ${unpaired} active members not yet paired.\n\n`;
    }

    // Suggestions / strategy
    if (q.includes("suggest") || q.includes("advice") || q.includes("recommend") || q.includes("strategy")) {
      const active = await db.collection("users").countDocuments({ status: "active" });
      const txs = await db.collection("transactions").find({ verified: true }).toArray();
      const income = txs.filter((t: any) => t.type !== "expense").reduce((s: number, t: any) => s + (t.amount || 0), 0);
      answer += "Strategic recommendations:\\n";
      if (active < 30) answer += "• Growth: Focus on recruitment drives — you have " + active + " active members.\\n";
      if (income < 50000) answer += "• Finance: Increase contributions. Current income is KES " + income.toLocaleString() + ".\\n";
      answer += "• Engagement: Schedule weekly check-in reminders.\\n• Events: Plan 2-3 activities per quarter to keep members active.\\n";
    }

    if (!answer) {
      answer = "I did not understand the question. Try asking:\\n• How many members do we have?\\n• What is our financial status?\\n• Show me upcoming events\\n• What is our attendance?\\n• Suggest strategies";
    }

    return NextResponse.json({ answer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
