import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

export async function GET(req: NextRequest) {
  try {
    const eventId = req.nextUrl.searchParams.get("eventId");
    if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

    const db = await getDB();
    if (!db) throw new Error("DB failed");

    const event = await db.collection("events").findOne({ _id: new mongoose.Types.ObjectId(eventId) });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const attendance = await db.collection("attendance").find({ eventId: event._id }).toArray();
    const userIds = attendance.map((a: any) => a.memberId);
    const users = await db.collection("users").find({ _id: { $in: userIds } }).toArray();

    const settings = await db.collection("settings").findOne({ key: "app" });
    const logoUrl = settings?.logoUrl || "";
    const orgName = settings?.orgName || "Forge Youth";

    const memberRows = attendance.map((a: any, i: number) => {
      const u = users.find((x: any) => x._id.toString() === a.memberId.toString());
      return {
        num: i + 1,
        name: u?.fullName || "Unknown",
        phone: u?.phone || "-",
        outstation: u?.outstation || "-",
        status: a.status || "present",
        self: a.selfCheckIn ? "✅ Self" : "Manual"
      };
    });

    const html = buildHTML(event, memberRows, orgName, logoUrl);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function buildHTML(event: any, rows: any[], orgName: string, logoUrl: string) {
  const date = new Date(event.date).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" });
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Attendance - ${event.title}</title>
<style>
  @page { size: A4; margin: 15mm; }
  body { font-family: "Times New Roman", serif; color: #000; margin: 0; padding: 20px; }
  .header { text-align: center; margin-bottom: 20px; }
  .logo { max-height: 80px; margin-bottom: 10px; }
  h1 { font-size: 22px; margin: 5px 0; }
  h2 { font-size: 16px; margin: 5px 0; font-weight: normal; color: #555; }
  .meta { margin: 15px 0; font-size: 14px; }
  .meta p { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
  th, td { border: 1px solid #333; padding: 6px 8px; font-size: 12px; text-align: left; }
  th { background: #f0f0f0; font-weight: bold; }
  .sigs { margin-top: 40px; display: flex; justify-content: space-between; gap: 20px; }
  .sig { flex: 1; text-align: center; }
  .sig-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; font-size: 12px; }
  .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #888; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 20px;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #1a1a2e; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">🖨️ Print / Save as PDF</button>
  </div>
  <div class="header">
    ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Logo" />` : ""}
    <h1>${orgName}</h1>
    <h2>Official Attendance Sheet</h2>
  </div>
  <div class="meta">
    <p><strong>Event:</strong> ${event.title}</p>
    <p><strong>Date:</strong> ${date}${event.time ? " · " + event.time : ""}</p>
    <p><strong>Venue:</strong> ${event.venue}</p>
    <p><strong>Total Present:</strong> ${rows.length} members</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString("en-KE")}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Full Name</th>
        <th style="width: 110px;">Phone</th>
        <th style="width: 90px;">Outstation</th>
        <th style="width: 80px;">Check-in</th>
        <th style="width: 120px;">Signature</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map((r, i) => `
        <tr>
          <td>${r.num}</td>
          <td>${r.name}</td>
          <td>${r.phone}</td>
          <td>${r.outstation}</td>
          <td>${r.self}</td>
          <td>&nbsp;</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  <div class="sigs">
    <div class="sig">
      <div class="sig-line">Moderator</div>
    </div>
    <div class="sig">
      <div class="sig-line">Patron / Matron</div>
    </div>
    <div class="sig">
      <div class="sig-line">Father In-Charge / Chaplain</div>
    </div>
  </div>
  <div class="footer">
    <p>Victory through Discipline · Forge Youth Uthiru-Kagondo-Kinoo</p>
  </div>
</body>
</html>`;
}
