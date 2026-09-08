import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { initiateSTKPush } from "@/lib/mpesa";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, purpose } = await req.json();

    // Validate
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!purpose) {
      return NextResponse.json({ error: "Purpose is required" }, { status: 400 });
    }

    const phone = session.user.phone;

    // Initiate STK Push
    const response = await initiateSTKPush(phone, amount, purpose, "Kinoo YSC Contribution");

    // Save transaction
    await connectDB();
    const transaction = await Transaction.create({
      fromUser: session.user.id,
      amount,
      purpose,
      checkoutRequestID: response.checkoutRequestID,
      verified: false
    });

    return NextResponse.json({
      success: true,
      message: "M-Pesa prompt sent to your phone",
      checkoutRequestID: response.checkoutRequestID,
      transactionId: transaction._id
    });

  } catch (error: any) {
    console.error("Contribution error:", error);
    return NextResponse.json({ 
      error: error.message || "M-Pesa request failed" 
    }, { status: 500 });
  }
}

// Get user's transactions
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const transactions = await Transaction.find({ fromUser: session.user.id })
      .sort({ date: -1 })
      .limit(50);

    return NextResponse.json(transactions);

  } catch (error: any) {
    console.error("Transaction fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}