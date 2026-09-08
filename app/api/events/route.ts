import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { hasPermission } from "@/lib/roles";

// Create event (Organising Secretary only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !hasPermission(session.user.roles, "create_event")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const { title, date, venue, description, ticketPrice } = await req.json();

    // Validate
    if (!title || !date || !venue) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const eventDate = new Date(date);
    const now = new Date();

    // Event must be at least 2 weeks away
    if (eventDate.getTime() - now.getTime() < 14 * 24 * 60 * 60 * 1000) {
      return NextResponse.json({ 
        error: "Event must be at least 2 weeks away" 
      }, { status: 400 });
    }

    const event = await Event.create({
      title,
      date: eventDate,
      venue,
      description,
      ticketPrice: ticketPrice || 0,
      priceSetDate: new Date(),
      organizerId: session.user.id,
      status: 'upcoming'
    });

    return NextResponse.json(event);

  } catch (error: any) {
    console.error("Event creation error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

// Get all events
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const events = await Event.find()
      .populate('organizerId', 'fullName phone')
      .sort({ date: 1 });

    return NextResponse.json(events);

  } catch (error: any) {
    console.error("Event fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}