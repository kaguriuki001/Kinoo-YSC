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

// Get current week info
function getCurrentWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  const sunday = new Date(now.setDate(diff));
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  return {
    weekId: `${sunday.getFullYear()}-W${Math.ceil((sunday.getDate() + 6) / 7)}-${sunday.getMonth() + 1}`,
    opensAt: sunday,
    closesAt: saturday,
    isOpen: now >= sunday && now <= saturday
  };
}

export async function GET(req: NextRequest) {
  try {
    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const week = getCurrentWeek();
    const user = await db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { projection: { checkInHistory: { $slice: -4 }, pairId: 1, pairPartnerId: 1, fullName: 1 } }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if checked in this week
    const recentCheckIns = user.checkInHistory || [];
    const checkedInThisWeek = recentCheckIns.some((c: any) => c.weekId === week.weekId);

    // Get pair partner status
    let partnerStatus = null;
    if (user.pairPartnerId) {
      try {
        const partner = await db.collection('users').findOne(
          { _id: new mongoose.Types.ObjectId(user.pairPartnerId) },
          { projection: { fullName: 1, checkInHistory: { $slice: -4 } } }
        );
        if (partner) {
          const partnerCheckedIn = (partner.checkInHistory || []).some((c: any) => c.weekId === week.weekId);
          partnerStatus = {
            name: partner.fullName,
            checkedIn: partnerCheckedIn
          };
        }
      } catch (e) {}
    }

    return NextResponse.json({
      week,
      checkedInThisWeek,
      recentCheckIns,
      partnerStatus
    }, {
      headers: { 'Cache-Control': 'no-store' }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const week = getCurrentWeek();

    if (!week.isOpen) {
      return NextResponse.json({
        error: "Check-in window is closed",
        week
      }, { status: 400 });
    }

    const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Already checked in?
    const alreadyCheckedIn = (user.checkInHistory || []).some((c: any) => c.weekId === week.weekId);
    if (alreadyCheckedIn) {
      return NextResponse.json({
        message: "Already checked in this week",
        week
      });
    }

    // Add check-in
    await db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $push: {
          checkInHistory: {
            weekId: week.weekId,
            checkedInAt: new Date()
          }
        },
        $set: {
          lastCheckIn: new Date()
        }
      }
    );

    // Notify partner
    if (user.pairPartnerId) {
      try {
        await db.collection('notifications').insertOne({
          id: Date.now().toString(),
          title: "Pair Check-in",
          message: `${user.fullName} has checked in for this week`,
          type: 'pair',
          userId: user.pairPartnerId,
          timestamp: new Date(),
          read: false
        });
      } catch (e) {}
    }

    return NextResponse.json({
      message: "Check-in successful!",
      week,
      checkedInAt: new Date()
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
