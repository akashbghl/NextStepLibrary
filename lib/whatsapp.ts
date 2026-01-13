import axios from "axios";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID =
  process.env.WHATSAPP_PHONE_NUMBER_ID;

if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
  throw new Error("❌ WhatsApp credentials missing in env");
}

const BASE_URL = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

interface SendWhatsAppOptions {
  to: string; // country code required e.g. 91XXXXXXXXXX
  message: string;
}

/**
 * Send WhatsApp Message
 */
export async function sendWhatsAppMessage({
  to,
  message,
}: SendWhatsAppOptions) {
  try {
    const response = await axios.post(
      BASE_URL,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ WhatsApp sent:", response.data);
    return true;
  } catch (error: any) {
    console.error(
      "❌ WhatsApp send failed:",
      error?.response?.data || error.message
    );
    return false;
  }
}
