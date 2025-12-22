import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { randomUUID } from "crypto";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

// Use environment variables or fallback to hardcoded values
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://govktyrtmwzbzqkmzmrf.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvdmt0eXJ0bXd6Ynpxa216bXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2OTU2NiwiZXhwIjoyMDcwMzQ1NTY2fQ.Zf6HI1O9ROsRersiYukXzwznHVXALs2EDYiSGLchyVI";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("Adding Tyson Tolleson delivery record...\n");

  // Thursday, December 18, 2025
  // ETA: 14:30 (2:30 PM Arizona time)
  // Arizona is UTC-7, so 14:30 Arizona = 21:30 UTC
  const scheduledDate = new Date("2025-12-18T21:30:00.000Z");

  const vrNumber = "121825-90";

  console.log(`VR Number: ${vrNumber}`);
  console.log(`Scheduled Date: ${scheduledDate.toLocaleString("en-US", { timeZone: "America/Phoenix" })}`);
  console.log(`ETA: 14:30\n`);

  // Check if record already exists
  const { data: existing, error: checkError } = await supabase
    .from("wd_delivery_records")
    .select("*")
    .eq("vrNumber", vrNumber)
    .maybeSingle();

  if (checkError && checkError.code !== "PGRST116") {
    console.error("Error checking existing record:", checkError);
    process.exit(1);
  }

  if (existing) {
    console.log(`Record already exists for ${vrNumber}. Updating...`);
    const { data: updated, error: updateError } = await supabase
      .from("wd_delivery_records")
      .update({
        scheduledDate: scheduledDate.toISOString(),
        status: "scheduled",
        tonnage: 20,
        notes: "Tyson Tolleson, AZ delivery - separate from Nestle loads. ETA: 14:30",
        updatedAt: new Date().toISOString(),
      })
      .eq("vrNumber", vrNumber)
      .select()
      .single();

    if (updateError) {
      console.error(`❌ Error updating ${vrNumber}:`, updateError);
      process.exit(1);
    } else {
      console.log(`✅ Updated delivery record for ${vrNumber}`);
      console.log(`   Notes: ${updated.notes}`);
      console.log(`   Scheduled: ${new Date(updated.scheduledDate).toLocaleString("en-US", { timeZone: "America/Phoenix" })}`);
    }
  } else {
    console.log(`Creating new delivery record for ${vrNumber}...`);
    const { data: created, error: createError } = await supabase
      .from("wd_delivery_records")
      .insert({
        id: randomUUID(),
        vrNumber: vrNumber,
        loadNumber: 0,
        status: "scheduled",
        tonnage: 20,
        scheduledDate: scheduledDate.toISOString(),
        notes: "Tyson Tolleson, AZ delivery - separate from Nestle loads. ETA: 14:30",
        photoUrls: "[]",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error(`❌ Error creating ${vrNumber}:`, createError);
      process.exit(1);
    } else {
      console.log(`✅ Created delivery record for ${vrNumber}`);
      console.log(`   Notes: ${created.notes}`);
      console.log(`   Scheduled: ${new Date(created.scheduledDate).toLocaleString("en-US", { timeZone: "America/Phoenix" })}`);
    }
  }

  console.log("\n✨ Done!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  });

