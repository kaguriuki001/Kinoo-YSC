import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { eventId, memberId, status } = await req.json();
    const { connectDB } = await import("@/lib/db");
    const Attendance = (await import("@/models/Attendance")).default;
    await connectDB();

    const record = await Attendance.create({ eventId, memberId, status, date: new Date() });
    return NextResponse.json({ message: "Attendance saved!", record });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const eventId = req.nextUrl.searchParams.get("eventId");
    const { connectDB } = await import("@/lib/db");
    const Attendance = (await import("@/models/Attendance")).default;
    await connectDB();

    const records = await Attendance.find(eventId ? { eventId } : {})
      .populate('memberId', 'fullName phone')
      .populate('eventId', 'title date')
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}