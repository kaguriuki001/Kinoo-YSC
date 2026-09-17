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

// GET: Check if user has pending feedback OR list feedback for an event
export async function GET(req: NextRequest) {
  try {
    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const userId = req.nextUrl.searchParams.get("userId");
    const eventId = req.nextUrl.searchParams.get("eventId");
    const action = req.nextUrl.searchParams.get("action");

    // Check for pending feedback (user just came back from event)
    if (action === 'pending' && userId) {
      const now = new Date();
      const events = await db.collection('events').find({ status: 'completed' }).toArray();

      const pending = [];
      for (const e of events) {
        // Was event within last 24 hours after it ended? (assume event date = end)
        const eventEnd = new Date(e.date);
        eventEnd.setHours(23, 59, 59, 999);
        const windowEnd = new Date(eventEnd.getTime() + 24 * 60 * 60 * 1000);

        if (now > windowEnd) continue; // window closed
        if (now < eventEnd) continue; // hasn't ended yet

        // Check if user attended (is in event attendees OR registered for it)
        const attended = await db.collection('attendance').findOne({
          eventId: e._id,
          memberId: new mongoose.Types.ObjectId(userId),
          status: 'present'
        });

        if (!attended) continue;

        // Check if already submitted feedback
        const existing = await db.collection('event_feedback').findOne({
          eventId: e._id.toString(),
          userId
        });

        if (existing) continue;

        pending.push({
          eventId: e._id.toString(),
          eventTitle: e.title,
          eventDate: e.date,
          windowClosesAt: windowEnd,
          hoursLeft: Math.max(0, Math.floor((windowEnd.getTime() - now.getTime()) / (60 * 60 * 1000)))
        });
      }

      return NextResponse.json({ pending });
    }

    // List all feedback for an event
    if (eventId) {
      const feedback = await db.collection('event_feedback')
        .find({ eventId })
        .sort({ submittedAt: -1 })
        .toArray();

      const result = feedback.map((f: any) => ({
        _id: f._id.toString(),
        userId: f.userId,
        userName: f.userName,
        wentWell: f.wentWell || '',
        wentWrong: f.wentWrong || '',
        rating: f.rating || 0,
        anonymous: f.anonymous || false,
        includeInFrago: f.includeInFrago !== false,
        submittedAt: f.submittedAt
      }));

      return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json([]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Submit feedback
export async function POST(req: NextRequest) {
  try {
    const { eventId, userId, userName, wentWell, wentWrong, rating, anonymous } = await req.json();

    if (!eventId || !userId) {
      return NextResponse.json({ error: "Event and user required" }, { status: 400 });
    }

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    // Verify event exists and window is open
    const event = await db.collection('events').findOne({ _id: new mongoose.Types.ObjectId(eventId) });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const eventEnd = new Date(event.date);
    eventEnd.setHours(23, 59, 59, 999);
    const windowEnd = new Date(eventEnd.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();

    if (now > windowEnd) {
      return NextResponse.json({ error: "Feedback window has closed" }, { status: 400 });
    }

    // Verify user attended
    const attended = await db.collection('attendance').findOne({
      eventId: event._id,
      memberId: new mongoose.Types.ObjectId(userId),
      status: 'present'
    });

    if (!attended) {
      return NextResponse.json({ error: "Only attendees can give feedback" }, { status: 403 });
    }

    // Save feedback
    const result = await db.collection('event_feedback').insertOne({
      eventId,
      userId,
      userName: anonymous ? 'Anonymous' : userName,
      wentWell: wentWell || '',
      wentWrong: wentWrong || '',
      rating: rating || 0,
      anonymous: anonymous || false,
      includeInFrago: true,
      submittedAt: new Date(),
      __v: 0
    });

    return NextResponse.json({ message: "Feedback submitted", id: result.insertedId.toString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Moderator curates which feedback stays in FRAGO
export async function PATCH(req: NextRequest) {
  try {
    const { feedbackId, includeInFrago } = await req.json();

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    await db.collection('event_feedback').updateOne(
      { _id: new mongoose.Types.ObjectId(feedbackId) },
      { $set: { includeInFrago: includeInFrago === true } }
    );

    return NextResponse.json({ message: "Updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
