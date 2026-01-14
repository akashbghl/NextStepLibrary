import twilio from "twilio";

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

/* ======================================================
    Safety Check
====================================================== */

if (!ACCOUNT_SID || !AUTH_TOKEN || !WHATSAPP_FROM) {
  console.warn(
    "⚠️ Twilio WhatsApp credentials missing. WhatsApp messages will be skipped."
  );
}

/* ======================================================
    Twilio Client
====================================================== */

const client =
  ACCOUNT_SID && AUTH_TOKEN
    ? twilio(ACCOUNT_SID, AUTH_TOKEN) 
    : null;

interface SendWhatsAppOptions {
  to: string; // country code required e.g. +91XXXXXXXXXX
  message: string;
}

/* ======================================================
    Send WhatsApp Message
====================================================== */

export async function sendWhatsAppMessage({
  to,
  message,
}: SendWhatsAppOptions) {
  if (!client || !WHATSAPP_FROM) {
    console.warn("⚠️ WhatsApp disabled. Skipping send.");
    return false;
  }

  try {
    // ✅ Normalize phone number (DB has 10-digit Indian numbers)
    const cleaned = to.replace(/\D/g, ""); // remove spaces, symbols
    const formattedTo = `whatsapp:+91${cleaned}`;

    console.log("📱 Sending WhatsApp to:", formattedTo);

    const response = await client.messages.create({
      from: WHATSAPP_FROM,
      to: formattedTo,
      body: message,
    });

    console.log("✅ WhatsApp sent:", response.sid);
    return true;
  } catch (error: any) {
    console.error("❌ WhatsApp send failed:", error.message);
    return false;
  }
}
