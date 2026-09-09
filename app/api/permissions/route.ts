import { NextRequest, NextResponse } from "next/server";
import { getUserPermissions } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const { getToken } = await import("next-auth/jwt");
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "kinoo-ysc-secret-key-2026" });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const roles = token.roles || ['member'];
    const permissions = getUserPermissions(roles);
    return NextResponse.json({ roles, permissions });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}