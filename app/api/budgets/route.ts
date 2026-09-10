import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { connectDB } = await import("@/lib/db");
    const Budget = (await import("@/models/Budget")).default;
    await connectDB();
    const budgets = await Budget.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, items, totalAmount, status } = await req.json();
    if (!title || !items || items.length === 0) return NextResponse.json({ error: "Title and items required" }, { status: 400 });

    const { connectDB } = await import("@/lib/db");
    const Budget = (await import("@/models/Budget")).default;
    await connectDB();

    const budget = await Budget.create({
      title,
      items: items.map((i: any) => ({ name: i.name, estimatedCost: Number(i.estimatedCost) || 0, actualCost: 0 })),
      totalAmount: Number(totalAmount) || items.reduce((s: number, i: any) => s + (Number(i.estimatedCost) || 0), 0),
      status: status || 'draft',
      createdAt: new Date()
    });

    return NextResponse.json({ message: "Budget created", budget });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed: " + error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    const { connectDB } = await import("@/lib/db");
    const Budget = (await import("@/models/Budget")).default;
    await connectDB();
    await Budget.findByIdAndUpdate(id, { status });
    return NextResponse.json({ message: "Budget updated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}