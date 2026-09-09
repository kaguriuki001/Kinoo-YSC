import { NextRequest, NextResponse } from "next/server";

let attendanceRecords: any[] = [];

export async function GET() {
  return NextResponse.json(attendanceRecords);
}

export async function POST(req: NextRequest) {
  try {
    const { eventId, memberId, status } = await req.json();
    const record = {
      id: Date.now().toString(),
      eventId,
      memberId,
      status, // 'present' | 'absent' | 'late'
      timestamp: new Date()
    };
    attendanceRecords.push(record);
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}