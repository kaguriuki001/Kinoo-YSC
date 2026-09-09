import { NextRequest, NextResponse } from "next/server";
import { getNotifications, markAsRead, broadcastNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const notifications = getNotifications();
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, message, type } = await req.json();
    const notif = broadcastNotification(title, message, type);
    return NextResponse.json(notif);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}