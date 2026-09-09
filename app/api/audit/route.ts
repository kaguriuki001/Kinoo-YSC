import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

let auditLogs: any[] = [];

export async function GET() {
  return NextResponse.json(auditLogs);
}

export async function POST(req: NextRequest) {
  try {
    const { action, performedBy, targetUser, reason } = await req.json();
    const previousHash = auditLogs.length > 0 ? auditLogs[auditLogs.length - 1].hash : '0';
    const data = JSON.stringify({ action, performedBy, targetUser, reason, timestamp: new Date() });
    const hash = createHash('sha256').update(previousHash + data).digest('hex');
    
    const entry = {
      action,
      performedBy,
      targetUser,
      reason,
      hash,
      previousHash,
      timestamp: new Date()
    };
    auditLogs.push(entry);
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: "Audit log failed" }, { status: 500 });
  }
}