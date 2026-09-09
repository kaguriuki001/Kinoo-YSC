import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { connectDB } = await import("@/lib/db");
    const Budget = (await import("@/models/Budget")).default;
    await connectDB();
    const budgets = await Budget.find().populate('eventId', 'title date').sort({ createdAt: -1 }).lean();
    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { eventId, items, createdBy } = await req.json();
    const { connectDB } = await import("@/lib/db");
    const Budget = (await import("@/models/Budget")).default;
    await connectDB();
    const budget = await Budget.create({ eventId, items, createdBy, status: 'draft' });
    return NextResponse.json(budget);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 });
  }
}