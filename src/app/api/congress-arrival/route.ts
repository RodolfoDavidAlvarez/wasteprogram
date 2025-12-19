import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/twilio";

const payloadSchema = z.object({
  visitType: z.string().optional(),
  referenceNumber: z.string().optional(),
  driverName: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  material: z.string().optional(),
  equipment: z.string().optional(),
  estimate: z.string().optional(),
  notes: z.string().optional(),
});

function buildMessage(body: z.infer<typeof payloadSchema>): string {
  const lines = [
    "Congress AZ arrival ping",
    `Purpose: ${body.visitType || "n/a"}`,
    `Reference: ${body.referenceNumber || "n/a"}`,
    `Driver: ${body.driverName || "n/a"}`,
    `Company: ${body.company || "n/a"}`,
    `Phone: ${body.phone || "n/a"}`,
    `Material: ${body.material || "n/a"}`,
    `Equip/Est: ${body.equipment || body.estimate ? [body.equipment, body.estimate].filter(Boolean).join(" | ") : "n/a"}`,
  ];

  if (body.notes && body.notes.trim()) {
    lines.push(`Notes: ${body.notes.trim()}`);
  }

  return lines.join("\n");
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const body = parsed.data;
  const hasMeaningfulContent = [
    body.referenceNumber,
    body.driverName,
    body.phone,
    body.company,
    body.material,
    body.notes,
  ].some((value) => value && value.trim().length > 0);

  if (!hasMeaningfulContent) {
    return NextResponse.json(
      { error: "Add at least one detail (reference, driver, phone, or notes)." },
      { status: 400 },
    );
  }

  let recipients: string[] = [];

  // Prefer DB-backed recipients; fall back to ADMIN_PHONE_NUMBER env.
  try {
    if (process.env.DATABASE_URL) {
      const rows = await prisma.alertRecipient.findMany({
        where: { active: true, site: "congress_az" },
        select: { phone: true },
      });
      recipients = rows.map((r) => r.phone).filter(Boolean);
    }
  } catch (error) {
    console.error("Failed to load alert recipients:", error);
  }

  if (!recipients.length && process.env.ADMIN_PHONE_NUMBER) {
    recipients.push(process.env.ADMIN_PHONE_NUMBER);
  }

  if (!recipients.length) {
    return NextResponse.json(
      { error: "No SMS recipients configured. Set ADMIN_PHONE_NUMBER or add alert recipients." },
      { status: 500 },
    );
  }

  const message = buildMessage(body);

  const results = await Promise.all(
    recipients.map((phone) =>
      sendSMS(phone, message).then((ok) => ({ phone, ok })).catch(() => ({ phone, ok: false })),
    ),
  );

  const success = results.some((r) => r.ok);

  if (!success) {
    return NextResponse.json({ error: "SMS delivery failed." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, sentTo: results });
}
