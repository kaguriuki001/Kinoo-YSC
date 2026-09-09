import { NextRequest, NextResponse } from "next/server";

// Bulk approve pending members
export async function POST(req: NextRequest) {
  try {
    const { action, userIds, role } = await req.json();
    const { connectDB } = await import("@/lib/db");
    const User = (await import("@/models/User")).default;
    await connectDB();

    if (action === 'approve') {
      const result = await User.updateMany(
        { _id: { $in: userIds }, status: 'pending' },
        { $set: { status: 'active' } }
      );
      return NextResponse.json({ message: `Approved ${result.modifiedCount} members` });
    }

    if (action === 'assignRole') {
      const result = await User.updateMany(
        { _id: { $in: userIds } },
        { $addToSet: { roles: role }, $set: { status: 'active' } }
      );
      return NextResponse.json({ message: `Role "${role}" assigned to ${result.modifiedCount} members` });
    }

    if (action === 'delete') {
      const result = await User.deleteMany({ _id: { $in: userIds } });
      return NextResponse.json({ message: `Deleted ${result.deletedCount} members` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}