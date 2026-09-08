import axios from "axios";

const MPESA_BASE_URL = "https://sandbox.safaricom.co.ke";

const getAccessToken = async (): Promise<string> => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY || "";
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || "";
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const res = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token;
};

export const initiateSTKPush = async (phone: string, amount: number, accountRef: string, desc: string) => {
  const token = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const passkey = process.env.MPESA_PASSKEY || "";
  const shortcode = process.env.MPESA_SHORTCODE || "174379";
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
  const formattedPhone = phone.startsWith("254") ? phone : `254${phone.replace(/^0/, "")}`;
  
  const data = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: formattedPhone,
    PartyB: shortcode,
    PhoneNumber: formattedPhone,
    CallBackURL: `${process.env.NEXTAUTH_URL || ""}/api/mpesa-callback`,
    AccountReference: accountRef.substring(0, 12),
    TransactionDesc: desc.substring(0, 13)
  };
  
  const res = await axios.post(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};