const WHATSAPP_API_URL = "https://graph.facebook.com/v19.0";

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage(to: string, text: string): Promise<WhatsAppResponse> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId || token === "PLACEHOLDER") {
    console.log("WhatsApp not configured - skipping message to", to);
    return { success: false, error: "WhatsApp not configured" };
  }

  // Format phone to international format (no + sign)
  let formattedTo = to.replace(/\D/g, "");
  if (formattedTo.startsWith("0")) formattedTo = "254" + formattedTo.substring(1);

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedTo,
        type: "text",
        text: { body: text }
      })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("WhatsApp error:", data);
      return { success: false, error: data.error?.message || "Failed to send" };
    }

    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error: any) {
    console.error("WhatsApp error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendBulkWhatsApp(recipients: string[], text: string): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const phone of recipients) {
    const result = await sendWhatsAppMessage(phone, text);
    if (result.success) sent++;
    else failed++;
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 100));
  }

  return { sent, failed };
}

export async function sendWhatsAppTemplate(to: string, templateName: string, params: string[]): Promise<WhatsAppResponse> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId || token === "PLACEHOLDER") {
    return { success: false, error: "WhatsApp not configured" };
  }

  let formattedTo = to.replace(/\D/g, "");
  if (formattedTo.startsWith("0")) formattedTo = "254" + formattedTo.substring(1);

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedTo,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: [{
            type: "body",
            parameters: params.map(p => ({ type: "text", text: p }))
          }]
        }
      })
    });

    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error?.message || "Failed" };
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}