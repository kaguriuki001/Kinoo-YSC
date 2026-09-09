import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { connectDB } = await import("@/lib/db");
    const Transaction = (await import("@/models/Transaction")).default;
    await connectDB();
    const transactions = await Transaction.find().populate('fromUser', 'fullName phone').sort({ date: -1 }).lean();
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}