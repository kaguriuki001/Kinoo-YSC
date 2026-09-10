import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import axios from "axios";

async function getDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  return mongoose.connection.db;
}

async function getAccessToken() {
  const key = process.env.MPESA_CONSUMER_KEY || "";
  const secret = process.env.MPESA_CONSUMER_SECRET || "";
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { phone, amount, purpose } = await req.json();

    if (!phone || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Phone and amount required" }, { status: 400 });
    }

    // Get M-Pesa settings from database
    const db = await getDB();
    const settings = await db?.collection('settings').findOne({ key: 'mpesa' });

    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) formattedPhone = "254" + formattedPhone.substring(1);
    if (formattedPhone.startsWith("7") || formattedPhone.startsWith("1")) formattedPhone = "254" + formattedPhone;

    // Use till number OR paybill from settings, fallback to env
    const shortcode = settings?.tillNumber || settings?.paybill || process.env.MPESA_SHORTCODE || "174379";
    const passkey = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const token = await getAccessToken();

    const data = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: settings?.tillNumber ? "CustomerBuyGoodsOnline" : "CustomerPayBillOnline",
      Amount: Math.floor(Number(amount)),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.NEXTAUTH_URL || "https://kinoo-ysc.vercel.app"}/api/mpesa-callback`,
      AccountReference: settings?.accountNumber || purpose || "Kinoo YSC",
      TransactionDesc: purpose || "Contribution"
    };

    const response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", data, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Save pending transaction
    if (db) {
      await db.collection('transactions').insertOne({
        amount: Number(amount),
        purpose: purpose || 'Contribution',
        type: 'income',
        checkoutRequestID: response.data.CheckoutRequestID,
        verified: false,
        date: new Date(),
        __v: 0
      });
    }

    return NextResponse.json({
      success: true,
      message: "M-Pesa prompt sent to your phone",
      checkoutRequestID: response.data.CheckoutRequestID
    });
  } catch (error: any) {
    console.error("M-Pesa error:", error.response?.data || error.message);
    return NextResponse.json({
      error: error.response?.data?.errorMessage || error.message || "M-Pesa failed"
    }, { status: 500 });
  }
}