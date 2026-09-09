import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { connectDB } = await import("@/lib/db");
    const Minute = (await import("@/models/Minute")).default;
    await connectDB();
    const minutes = await Minute.find().populate('uploadedBy', 'fullName').sort({ date: -1 }).lean();
    return NextResponse.json(minutes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch minutes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, uploadedBy, subcommitteeId } = await req.json();
    const { connectDB } = await import("@/lib/db");
    const Minute = (await import("@/models/Minute")).default;
    await connectDB();
    const minute = await Minute.create({ content, uploadedBy, subcommitteeId, readOnly: true });
    return NextResponse.json(minute);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save minutes" }, { status: 500 });
  }
}