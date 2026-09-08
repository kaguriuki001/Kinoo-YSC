import axios from "axios";

// Configuration
const MPESA_BASE_URL = process.env.MPESA_ENVIRONMENT === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY!;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || "174379";
const CALLBACK_URL = `${process.env.NEXTAUTH_URL}/api/mpesa-callback`;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get M-Pesa OAuth access token with automatic refresh
 */
const getAccessToken = async (): Promise<string> => {
  // Return cached token if still valid (with 60-second buffer)
  if (accessToken && tokenExpiry > Date.now() + 60000) {
    return accessToken;
  }

  try {
    const auth = Buffer.from(
      `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const response = await axios.get(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + parseInt(response.data.expires_in) * 1000;
    return accessToken!;
  } catch (error: any) {
    console.error("M-Pesa token generation failed:", error.message);
    throw new Error("Failed to get M-Pesa access token");
  }
};

/**
 * Format phone number to 254 format
 */
const formatPhone = (phone: string): string => {
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = "254" + clean.substring(1);
  } else if (clean.startsWith("7")) {
    clean = "254" + clean;
  } else if (clean.startsWith("1")) {
    clean = "254" + clean;
  }
  return clean;
};

/**
 * Initiate STK Push to customer's phone
 */
export const initiateSTKPush = async (
  phone: string,
  amount: number,
  accountRef: string,
  description: string
): Promise<any> => {
  try {
    const token = await getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const formattedPhone = formatPhone(phone);

    const data = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.floor(amount), // Ensure integer
      PartyA: formattedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: accountRef.substring(0, 12), // Max 12 chars
      TransactionDesc: description.substring(0, 13), // Max 13 chars
    };

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      checkoutRequestID: response.data.CheckoutRequestID,
      merchantRequestID: response.data.MerchantRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
    };
  } catch (error: any) {
    console.error("STK Push failed:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.errorMessage || "M-Pesa STK Push failed"
    );
  }
};

/**
 * Check transaction status (for verification)
 */
export const checkTransactionStatus = async (
  checkoutRequestID: string
): Promise<any> => {
  try {
    const token = await getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Status check failed:", error.response?.data || error.message);
    throw new Error("Failed to check transaction status");
  }
};

/**
 * Register C2B URLs (for receiving payments directly)
 */
export const registerC2BUrls = async (): Promise<any> => {
  try {
    const token = await getAccessToken();
    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/c2b/v1/registerurl`,
      {
        ShortCode: MPESA_SHORTCODE,
        ResponseType: "Completed",
        ConfirmationURL: `${CALLBACK_URL}/confirmation`,
        ValidationURL: `${CALLBACK_URL}/validation`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("C2B registration failed:", error.response?.data || error.message);
    throw new Error("Failed to register C2B URLs");
  }
};

/**
 * Format amount with KES currency
 */
export const formatKES = (amount: number): string => {
  return `KES ${amount.toLocaleString("en-KE")}`;
};

/**
 * Validate M-Pesa phone number
 */
export const validatePhone = (phone: string): boolean => {
  const clean = phone.replace(/\D/g, "");
  const formatted = formatPhone(clean);
  return formatted.length === 12 && formatted.startsWith("254");
};