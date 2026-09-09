import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { connectDB } = await import("@/lib/db");
    const User = (await import("@/models/User")).default;
    const Transaction = (await import("@/models/Transaction")).default;
    const Event = (await import("@/models/Event")).default;
    await connectDB();

    const totalMembers = await User.countDocuments();
    const activeMembers = await User.countDocuments({ status: 'active' });
    const totalTransactions = await Transaction.countDocuments();
    const verifiedTransactions = await Transaction.countDocuments({ verified: true });
    const totalEvents = await Event.countDocuments();
    
    const income = await Transaction.aggregate([
      { $match: { verified: true } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    return NextResponse.json({
      totalMembers,
      activeMembers,
      totalTransactions,
      verifiedTransactions,
      totalEvents,
      totalIncome: income[0]?.total || 0,
      generatedAt: new Date(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}