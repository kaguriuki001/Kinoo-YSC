import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (!MONGODB_URI) throw new Error("MONGODB_URI missing");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.roles?.includes('father') || user.roles?.includes('moderator')) {
      const admins = await db.collection('users').countDocuments({
        $or: [{ roles: 'father' }, { roles: 'moderator' }],
        status: 'active',
        _id: { $ne: new mongoose.Types.ObjectId(userId) }
      });
      if (admins === 0) {
        return NextResponse.json({ error: "Cannot delete the last admin. Assign another admin first." }, { status: 400 });
      }
    }

    await db.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(userId) });

    await db.collection('transactions').updateMany(
      { fromUser: new mongoose.Types.ObjectId(userId) },
      { $set: { fromUser: null } }
    );

    return NextResponse.json({ message: `${user.fullName} deleted successfully` });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}