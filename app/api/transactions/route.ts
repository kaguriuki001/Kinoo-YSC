import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { connectDB } = await import("@/lib/db");
    const Transaction = (await import("@/models/Transaction")).default;
    await connectDB();
    const transactions = await Transaction.find().populate('fromUser', 'fullName phone').sort({ date: -1 }).lean();
    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("GET transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, purpose, type, description, memberId } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!purpose) {
      return NextResponse.json({ error: "Purpose required" }, { status: 400 });
    }

    const { connectDB } = await import("@/lib/db");
    const Transaction = (await import("@/models/Transaction")).default;
    await connectDB();

    const tx = await Transaction.create({
      amount: Number(amount),
      purpose,
      type: type || 'income',
      description: description || '',
      fromUser: memberId || undefined,
      verified: true,
      date: new Date()
    });

    console.log("Transaction created:", tx);
    return NextResponse.json({ message: "Transaction added", transaction: tx });
  } catch (error: any) {
    console.error("POST transaction error:", error);
    return NextResponse.json({ error: "Failed to add: " + error.message }, { status: 500 });
  }
}