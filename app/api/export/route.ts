import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { connectDB } = await import("@/lib/db");
    const User = (await import("@/models/User")).default;
    await connectDB();

    const users = await User.find().sort({ createdAt: -1 }).lean();
    
    let csv = "Name,Phone,Roles,Status,CreatedAt\n";
    users.forEach((u: any) => {
      csv += `${u.fullName},${u.phone},${u.roles?.join(';')},${u.status},${new Date(u.createdAt).toISOString()}\n`;
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=members.csv"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}