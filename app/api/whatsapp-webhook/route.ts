import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  
  if (token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Invalid token", { status: 403 });
}

export async function POST(req: NextRequest) {
  // Placeholder for now - will implement when WhatsApp credentials are ready
  return NextResponse.json({ success: true });
}