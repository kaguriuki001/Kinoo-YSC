import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const { conversationId, userId, userName } = await req.json();
    if (!conversationId || !userId) {
      return NextResponse.json({ error: "conversationId and userId required" }, { status: 400 });
    }
    await pusherServer.trigger("conversation-" + conversationId, "typing", {
      userId,
      userName,
      timestamp: Date.now()
    });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
