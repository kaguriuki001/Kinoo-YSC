import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("M-Pesa Callback:", JSON.stringify(body));

    if (body.Body?.stkCallback?.ResultCode === 0) {
      const metadata = body.Body.stkCallback.CallbackMetadata?.Item || [];
      const receipt = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      const checkoutId = body.Body.stkCallback.CheckoutRequestID;

      const db = await getDB();
      if (db) {
        await db.collection('transactions').updateOne(
          { checkoutRequestID: checkoutId },
          { $set: { mpesaReceipt: receipt, verified: true, date: new Date() } }
        );
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error: any) {
    console.error("Callback error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Error" }, { status: 500 });
  }
}