import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import axios from "axios";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (!MONGODB_URI) throw new Error("MONGODB_URI missing");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

async function getAccessToken() {
  const key = process.env.MPESA_CONSUMER_KEY || "";
  const secret = process.env.MPESA_CONSUMER_SECRET || "";
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  const env = process.env.MPESA_ENVIRONMENT === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

  const res = await axios.get(`${env}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return { token: res.data.access_token, baseUrl: env };
}

function formatPhone(phone: string): string {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) p = "254" + p.substring(1);
  if (p.startsWith("7") || p.startsWith("1")) p = "254" + p;
  return p;
}

export async function POST(req: NextRequest) {
  try {
    const { phone, amount, purpose, memberId } = await req.json();

    if (!phone || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Phone and amount required" }, { status: 400 });
    }

    const db = await getDB();
    const settings = await db?.collection('settings').findOne({ key: 'mpesa' });

    const formattedPhone = formatPhone(phone);

    let shortcode = "";
    let transactionType = "";

    if (settings?.tillNumber) {
      shortcode = settings.tillNumber;
      transactionType = "CustomerBuyGoodsOnline";
    } else if (settings?.paybill) {
      shortcode = settings.paybill;
      transactionType = "CustomerPayBillOnline";
    } else {
      shortcode = process.env.MPESA_SHORTCODE || "174379";
      transactionType = "CustomerPayBillOnline";
    }

    const passkey = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const { token, baseUrl } = await getAccessToken();

    const callbackUrl = `${process.env.NEXTAUTH_URL || "https://kinoo-ysc.vercel.app"}/api/mpesa-callback`;

    const data: any = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: transactionType,
      Amount: Math.floor(Number(amount)),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: (settings?.accountNumber || purpose || "FORGEYOUTH").substring(0, 12),
      TransactionDesc: (purpose || "Contribution").substring(0, 13)
    };

    const response = await axios.post(`${baseUrl}/mpesa/stkpush/v1/processrequest`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (db) {
      await db.collection('transactions').insertOne({
        amount: Number(amount),
        purpose: purpose || 'Contribution',
        type: 'income',
        fromUser: memberId ? new mongoose.Types.ObjectId(memberId) : null,
        checkoutRequestID: response.data.CheckoutRequestID,
        mpesaReceipt: null,
        verified: false,
        date: new Date(),
        __v: 0
      });
    }

    return NextResponse.json({
      success: true,
      message: "M-Pesa prompt sent. Check your phone.",
      checkoutRequestID: response.data.CheckoutRequestID,
      merchantRequestID: response.data.MerchantRequestID
    });

  } catch (error: any) {
    console.error("M-Pesa error:", error.response?.data || error.message);
    const errMsg = error.response?.data?.errorMessage
      || error.response?.data?.ResponseDescription
      || error.message
      || "M-Pesa failed";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}