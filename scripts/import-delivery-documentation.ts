/**
 * Import historical delivery documentation photos.
 *
 * - Uploads each file to Supabase Storage bucket: delivery-photos
 * - Upserts wd_delivery_records by vrNumber
 * - Appends public URLs into photoUrls (JSON array stored as TEXT)
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/import-delivery-documentation.ts
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { supabase, STORAGE_BUCKETS } from "../src/lib/supabase";

function uuid() {
  // Node 20 supports crypto.randomUUID, but keep a safe fallback
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const c = require("crypto");
  return typeof c.randomUUID === "function" ? c.randomUUID() : `${Date.now()}-${Math.random()}`;
}

type ImportItem = {
  filePath: string;
  vrNumber: string; // e.g. "121725-41"
};

const DELIVERY_DOCS_DIR = path.resolve(__dirname, "../../Deliveries Documentation");

// Mapping derived from the provided photos (highlighted #VR... on the forms)
const ITEMS: ImportItem[] = [
  { filePath: path.join(DELIVERY_DOCS_DIR, "1880534894610946612.JPG"), vrNumber: "121125-109" },
  { filePath: path.join(DELIVERY_DOCS_DIR, "1880534894610946612 2.JPG"), vrNumber: "121125-109" },
  { filePath: path.join(DELIVERY_DOCS_DIR, "2059639793527238863.JPG"), vrNumber: "121025-117" },
  { filePath: path.join(DELIVERY_DOCS_DIR, "5397939214619814614.JPG"), vrNumber: "121225-98" },
  { filePath: path.join(DELIVERY_DOCS_DIR, "7326494429365461275.JPG"), vrNumber: "121625-45" },
  { filePath: path.join(DELIVERY_DOCS_DIR, "7640585088448520945.JPG"), vrNumber: "121125-110" },
  { filePath: path.join(DELIVERY_DOCS_DIR, "7746227247647878040.JPG"), vrNumber: "121525-49" },
  { filePath: path.join(DELIVERY_DOCS_DIR, "7746227247647878040 2.JPG"), vrNumber: "121525-49" },
  { filePath: path.join(DELIVERY_DOCS_DIR, "1406406419469277572.HEIC"), vrNumber: "121525-50" },
  { filePath: path.join(DELIVERY_DOCS_DIR, "4155126366111456057.HEIC"), vrNumber: "121725-72" },
  { filePath: path.join(DELIVERY_DOCS_DIR, "953631318295729154.HEIC"), vrNumber: "121725-41" },
];

function guessScheduledDateFromVr(vrNumber: string): Date {
  // VR format: MMDDYY-XX
  const mm = Number(vrNumber.slice(0, 2));
  const dd = Number(vrNumber.slice(2, 4));
  const yy = Number(vrNumber.slice(4, 6));
  const year = 2000 + yy;
  // Use noon UTC to avoid TZ midnight shifts
  return new Date(Date.UTC(year, mm - 1, dd, 12, 0, 0));
}

function contentTypeForExt(ext: string) {
  const e = ext.toLowerCase();
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
  if (e === ".png") return "image/png";
  if (e === ".heic") return "image/heic";
  return "application/octet-stream";
}

async function uploadFileToDeliveryPhotos(filePath: string, vrNumber: string) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath);

  const objectPath = `${vrNumber}/${Date.now()}-${base}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKETS.DELIVERY_PHOTOS).upload(objectPath, buf, {
    contentType: contentTypeForExt(ext),
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed for ${base}: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKETS.DELIVERY_PHOTOS).getPublicUrl(objectPath);

  return urlData.publicUrl;
}

async function main() {
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  Importing Delivery Documentation → Supabase Storage + DB");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Sanity check folder exists
  if (!fs.existsSync(DELIVERY_DOCS_DIR)) {
    throw new Error(`Folder not found: ${DELIVERY_DOCS_DIR}`);
  }

  for (const item of ITEMS) {
    const { filePath, vrNumber } = item;
    const base = path.basename(filePath);

    if (!fs.existsSync(filePath)) {
      console.warn(`- SKIP missing file: ${base}`);
      continue;
    }

    console.log(`\n→ ${base}`);
    console.log(`  VR: ${vrNumber}`);

    // Ensure record exists (use Supabase REST via service role; avoids Prisma DATABASE_URL issues)
    const scheduledDate = guessScheduledDateFromVr(vrNumber);
    const { data: existingRows, error: existingErr } = await supabase.from("wd_delivery_records").select("*").eq("vrNumber", vrNumber).limit(1);

    if (existingErr) throw new Error(`Failed to read record ${vrNumber}: ${existingErr.message}`);

    const existingRow = existingRows?.[0] ?? null;

    if (!existingRow) {
      const { error: insertErr } = await supabase.from("wd_delivery_records").insert({
        id: uuid(),
        vrNumber,
        loadNumber: 0,
        status: "scheduled",
        deliveredAt: null,
        deliveredBy: null,
        photoUrls: null,
        notes: "Imported historical documentation",
        tonnage: 20,
        scheduledDate: scheduledDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      if (insertErr) throw new Error(`Failed to insert record ${vrNumber}: ${insertErr.message}`);
    } else {
      const { error: touchErr } = await supabase.from("wd_delivery_records").update({ updatedAt: new Date().toISOString() }).eq("vrNumber", vrNumber);
      if (touchErr) throw new Error(`Failed to update record ${vrNumber}: ${touchErr.message}`);
    }

    // Upload file
    const url = await uploadFileToDeliveryPhotos(filePath, vrNumber);
    console.log(`  Uploaded: ${url}`);

    // Append URL
    const currentRows = existingRow
      ? [existingRow]
      : ((await supabase.from("wd_delivery_records").select("*").eq("vrNumber", vrNumber).limit(1)).data ?? []);
    const current = currentRows[0];
    const existing: string[] = current?.photoUrls ? JSON.parse(current.photoUrls) : [];
    if (!existing.includes(url)) {
      existing.push(url);
    }

    const { error: updateErr } = await supabase
      .from("wd_delivery_records")
      .update({ photoUrls: JSON.stringify(existing), updatedAt: new Date().toISOString() })
      .eq("vrNumber", vrNumber);
    if (updateErr) throw new Error(`Failed to update photoUrls for ${vrNumber}: ${updateErr.message}`);

    console.log(`  Photos on record: ${existing.length}`);
  }

  console.log("\n✅ Import complete\n");
}

main()
  .catch((err) => {
    console.error("\n❌ Import failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {});



