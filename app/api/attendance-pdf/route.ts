import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const eventTitle = req.nextUrl.searchParams.get("event") || "Event";
    const { connectDB } = await import("@/lib/db");
    const User = (await import("@/models/User")).default;
    await connectDB();
    
    const members = await User.find({ status: 'active' }).lean();
    
    let html = `
      <html><head><title>${eventTitle} - Attendance</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { text-align: center; color: #1a1a2e; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #1a1a2e; color: white; }
        .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
        .sig-line { width: 30%; text-align: center; border-top: 1px solid #000; padding-top: 5px; }
      </style></head><body>
      <h1>${eventTitle} - Attendance List</h1>
      <p>Date: ${new Date().toLocaleDateString()}</p>
      <table>
        <tr><th>#</th><th>Name</th><th>Phone</th><th>Signature</th></tr>
        ${members.map((m: any, i: number) => `<tr><td>${i + 1}</td><td>${m.fullName}</td><td>${m.phone}</td><td>.................</td></tr>`).join('')}
      </table>
      <div class="signatures">
        <div class="sig-line">Moderator</div>
        <div class="sig-line">Patron/Matron</div>
        <div class="sig-line">Father In-Charge</div>
      </div>
      </body></html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename=attendance-${Date.now()}.html`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}