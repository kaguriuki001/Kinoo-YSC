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

export async function GET() {
  try {
    const db = await getDB();
    if (!db) throw new Error("DB failed");
    const events = await db.collection('events').find({}).sort({ date: 1 }).toArray();
    const result = events.map((e: any) => ({
      _id: e._id.toString(),
      title: e.title,
      date: e.date,
      time: e.time || '',
      venue: e.venue,
      description: e.description || '',
      ticketPrice: e.ticketPrice || 0,
      logistics: e.logistics || {},
      createdAt: e.createdAt
    }));
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, date, time, venue, description, ticketPrice, logistics } = body;

    if (!title || !date || !venue) {
      return NextResponse.json({ error: "Title, date, and venue required" }, { status: 400 });
    }

    // 2-week rule
    const eventDate = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 14) {
      return NextResponse.json({ error: `Event must be at least 14 days away. Currently ${diffDays} days.` }, { status: 400 });
    }

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const result = await db.collection('events').insertOne({
      title,
      date: eventDate,
      time: time || '',
      venue,
      description: description || '',
      ticketPrice: Number(ticketPrice) || 0,
      logistics: logistics || {},
      status: 'upcoming',
      createdAt: new Date(),
      __v: 0
    });

    return NextResponse.json({ message: "Event created", id: result.insertedId });
  } catch (error: any) {
    console.error("POST event error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}