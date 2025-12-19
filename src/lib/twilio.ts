import twilio from "twilio";

// Helper function to check SMS enabled at runtime (not module load time)
function isSmsEnabled(): boolean {
  const value = process.env.ENABLE_SMS;
  if (!value) return false;
  const trimmed = String(value).trim().toLowerCase();
  return trimmed === "true";
}

// Helper function to get Twilio client
function getTwilioClient(): twilio.Twilio | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const smsEnabled = isSmsEnabled();

  if (accountSid && authToken && smsEnabled) {
    return twilio(accountSid, authToken);
  }
  return null;
}

/**
 * Wraps URLs in angle brackets to prevent SMS clients from breaking long links
 */
function wrapUrlsInAngleBrackets(message: string): string {
  const urlPattern = /(?<!<)(https?:\/\/[^\s<>]+)(?!>)/gi;
  return message.replace(urlPattern, "<$1>");
}

/**
 * Send an SMS message
 */
export async function sendSMS(to: string, message: string): Promise<boolean> {
  const smsEnabled = isSmsEnabled();

  if (!smsEnabled) {
    console.info("[SMS disabled] Would send to:", to, message);
    return false;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken) {
    console.warn("Twilio credentials missing.");
    return false;
  }

  if (!phoneNumber) {
    console.warn("TWILIO_PHONE_NUMBER missing.");
    return false;
  }

  const client = getTwilioClient();
  if (!client) {
    console.warn("Twilio client not initialized.");
    return false;
  }

  const processedMessage = wrapUrlsInAngleBrackets(message);

  try {
    await client.messages.create({
      body: processedMessage,
      from: phoneNumber,
      to: to,
    });
    return true;
  } catch (error: unknown) {
    const err = error as { code?: number; status?: number; message?: string };
    if (err?.code === 20003 || err?.status === 401) {
      console.warn("Twilio authentication failed.");
    } else if (err?.code === 21211) {
      console.warn("Invalid phone number format.");
    } else if (err?.code === 21608) {
      console.warn("Twilio phone number not verified.");
    } else {
      console.error("Error sending SMS:", err?.message || error);
    }
    return false;
  }
}

/**
 * Send delivery scheduled notification
 */
export async function sendDeliveryScheduledNotification(
  phone: string,
  details: {
    vrNumber: string;
    date: string;
    generator?: string;
  }
): Promise<boolean> {
  const message = `SSW Delivery Scheduled\n\nVR: ${details.vrNumber}\nDate: ${details.date}${details.generator ? `\nGenerator: ${details.generator}` : ""}\n\nThank you for your business!`;
  return sendSMS(phone, message);
}

/**
 * Send delivery completed notification
 */
export async function sendDeliveryCompletedNotification(
  phone: string,
  details: {
    vrNumber: string;
    tonnage: number;
  }
): Promise<boolean> {
  const lbs = Math.round(details.tonnage * 2000);
  const message = `SSW Delivery Complete\n\nVR: ${details.vrNumber}\nWeight: ${lbs.toLocaleString()} lbs (${details.tonnage.toFixed(2)} tons)\n\nThank you!`;
  return sendSMS(phone, message);
}

/**
 * Send weigh ticket notification
 */
export async function sendWeighTicketNotification(
  phone: string,
  details: {
    ticketNumber: string;
    carrierCompany?: string;
    grossWeight: number;
    tareWeight: number;
    netWeight: number;
    materialType?: string;
  }
): Promise<boolean> {
  const message = `SSW Weigh Ticket ${details.ticketNumber}\n\nCarrier: ${details.carrierCompany || "N/A"}\nMaterial: ${details.materialType || "N/A"}\nGross: ${details.grossWeight.toLocaleString()} lbs\nTare: ${details.tareWeight.toLocaleString()} lbs\nNet: ${details.netWeight.toLocaleString()} lbs`;
  return sendSMS(phone, message);
}

/**
 * Send custom notification to admin
 */
export async function notifyAdmin(message: string): Promise<boolean> {
  const adminPhone = process.env.ADMIN_PHONE_NUMBER;
  if (!adminPhone) {
    console.warn("ADMIN_PHONE_NUMBER not set");
    return false;
  }
  return sendSMS(adminPhone, message);
}
