import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("M-Pesa Callback received:", JSON.stringify(body));

    if (body.Body?.stkCallback?.ResultCode === 0) {
      const { CheckoutRequestID, MpesaReceiptNumber, Amount } = body.Body.stkCallback.CallbackMetadata?.Item?.reduce((acc: any, item: any) => {
        acc[item.Name] = item.Value;
        return acc;
      }, {}) || {};

      await connectDB();

      // Update transaction
      await Transaction.findOneAndUpdate(
        { checkoutRequestID: CheckoutRequestID },
        { 
          mpesaReceipt: MpesaReceiptNumber || CheckoutRequestID,
          verified: true 
        }
      );

      console.log(`Payment verified: ${MpesaReceiptNumber} for ${CheckoutRequestID}`);
    }

    // Always return success to M-Pesa
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

  } catch (error: any) {
    console.error("Callback error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Error" }, { status: 500 });
  }
}