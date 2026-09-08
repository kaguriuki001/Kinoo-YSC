import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Subcommittee from "@/models/Subcommittee";
import { hasPermission } from "@/lib/roles";

// Create subcommittee (Vice Moderator or Moderator)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !hasPermission(session.user.roles, "create_subcommittee")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const { name, chairId, secretaryId, memberIds } = await req.json();

    if (!name || !chairId || !secretaryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const subcommittee = await Subcommittee.create({
      name,
      chairUserId: chairId,
      secretaryUserId: secretaryId,
      members: memberIds || []
    });

    return NextResponse.json(subcommittee);

  } catch (error: any) {
    console.error("Subcommittee creation error:", error);
    return NextResponse.json({ error: "Failed to create subcommittee" }, { status: 500 });
  }
}

// Get all subcommittees
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const subcommittees = await Subcommittee.find()
      .populate('chairUserId', 'fullName phone')
      .populate('secretaryUserId', 'fullName phone')
      .populate('members', 'fullName phone');

    return NextResponse.json(subcommittees);

  } catch (error: any) {
    console.error("Subcommittee fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch subcommittees" }, { status: 500 });
  }
}