import axios from "axios";

const API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

export const sendWhatsAppMessage = async (to: string, text: string) => {
  await axios.post(API_URL, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { body: text }
  }, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
  });
};