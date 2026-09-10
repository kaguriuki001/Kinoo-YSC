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
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "kinoo-verify-token-2026";

  if (token === verifyToken) {
    console.log("WhatsApp webhook verified");
    return new Response(challenge, { status: 200 });
  }
  return new Response("Invalid token", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = body.entry?.[0];
    if (!entry) return NextResponse.json({ success: true });

    const changes = entry.changes?.[0]?.value;
    if (!changes?.messages?.length) return NextResponse.json({ success: true });

    const message = changes.messages[0];
    const from = message.from;
    const text = (message.text?.body || "").toLowerCase().trim();
    const senderName = changes.contacts?.[0]?.profile?.name || "there";

    // Handle commands
    let reply = "";

    const db = await getDB();
    const user = db ? await db.collection('users').findOne({ phone: from }) : null;

    if (text === "hi" || text === "hello" || text === "hey") {
      reply = `Hello ${senderName}! 👋 Welcome to Kinoo YSC.\n\nAvailable commands:\n• *events* - View upcoming events\n• *balance* - Check group balance\n• *contribute* - Make M-Pesa contribution\n• *help* - Show all commands`;
    } else if (text === "events") {
      const events = db ? await db.collection('events').find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(5).toArray() : [];
      if (events.length === 0) {
        reply = "📅 No upcoming events scheduled.";
      } else {
        reply = "📅 *Upcoming Events:*\n\n" + events.map((e: any, i: number) =>
          `${i + 1}. *${e.title}*\n   📆 ${new Date(e.date).toDateString()}\n   📍 ${e.venue}\n   🎟️ KES ${e.ticketPrice || 'Free'}`
        ).join("\n\n");
      }
    } else if (text === "balance") {
      const txs = db ? await db.collection('transactions').find({ verified: true }).toArray() : [];
      const income = txs.filter((t: any) => t.type !== 'expense').reduce((s: number, t: any) => s + (t.amount || 0), 0);
      const expenses = txs.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + (t.amount || 0), 0);
      reply = `💰 *Kinoo YSC Balance*\n\nIncome: KES ${income.toLocaleString()}\nExpenses: KES ${expenses.toLocaleString()}\n*Balance: KES ${(income - expenses).toLocaleString()}*`;
    } else if (text === "contribute") {
      reply = "💸 To contribute via M-Pesa, please login to your dashboard:\n\n🔗 https://kinoo-ysc.vercel.app/dashboard\n\nGo to *Giving* tab to send an M-Pesa prompt.";
    } else if (text === "help") {
      reply = `📋 *Kinoo YSC Bot Commands*\n\n*hi* - Welcome message\n*events* - View upcoming events\n*balance* - Check group balance\n*contribute* - How to contribute\n*help* - This message`;
    } else if (user) {
      reply = `Hi ${user.fullName}! Type *help* to see what I can do.`;
    } else {
      reply = `Welcome to Kinoo YSC! 👋\n\nType *help* to see available commands, or register at:\n🔗 https://kinoo-ysc.vercel.app/register`;
    }

    // Send reply
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (token && phoneId && token !== "PLACEHOLDER") {
      await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: reply }
        })
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ success: true });
  }
}