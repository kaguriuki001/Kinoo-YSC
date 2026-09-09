import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { csvData } = await req.json();
    
    if (!csvData || !csvData.trim()) {
      return NextResponse.json({ error: "No CSV data provided" }, { status: 400 });
    }

    const { connectDB } = await import("@/lib/db");
    const User = (await import("@/models/User")).default;
    await connectDB();

    const lines = csvData.split('\n').filter((l: string) => l.trim());
    let added = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const line of lines) {
      const parts = line.split(',').map((s: string) => s.trim());
      const fullName = parts[0];
      const phone = parts[1];
      const idNumber = parts[2] || '';

      if (!fullName || !phone) {
        skipped++;
        errors.push(`Skipped line: "${line}" - missing name or phone`);
        continue;
      }

      let formattedPhone = phone.replace(/\D/g, "");
      if (formattedPhone.startsWith("0")) formattedPhone = "254" + formattedPhone.substring(1);
      if (formattedPhone.startsWith("7")) formattedPhone = "254" + formattedPhone;
      if (formattedPhone.startsWith("1")) formattedPhone = "254" + formattedPhone;

      const existing = await User.findOne({ phone: formattedPhone });
      if (existing) {
        skipped++;
        errors.push(`Skipped ${fullName} - phone already registered`);
        continue;
      }

      const passwordHash = await bcrypt.hash("Kinoo123!", 12);
      await User.create({
        fullName,
        phone: formattedPhone,
        idNumber,
        passwordHash,
        status: 'active',
        roles: ['member']
      });
      added++;
    }

    return NextResponse.json({
      message: `Imported ${added} members, skipped ${skipped}`,
      added,
      skipped,
      errors
    });
  } catch (error: any) {
    console.error("CSV Import error:", error);
    return NextResponse.json({ error: "Import failed: " + error.message }, { status: 500 });
  }
}