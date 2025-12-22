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
  console.log("Updating Tyson Tolleson delivery status...\n");

  const vrNumber = "121825-90";
  // Delivery was on Dec 18, 2025 at 14:30 (2:30 PM Arizona time)
  const deliveredDate = new Date("2025-12-18T21:30:00.000Z"); // 14:30 Arizona = 21:30 UTC

  console.log(`VR Number: ${vrNumber}`);
  console.log(`Marking as delivered on: ${deliveredDate.toLocaleString("en-US", { timeZone: "America/Phoenix" })}\n`);

  // Update the delivery record to mark it as delivered
  const { data: updated, error: updateError } = await supabase
    .from("wd_delivery_records")
    .update({
      status: "delivered",
      deliveredAt: deliveredDate.toISOString(),
      deliveredBy: "Field Team",
      notes: "Tyson Tolleson, AZ delivery - separate from Nestle loads. ETA: 14:30. Delivered on 12/18/2025.",
      updatedAt: new Date().toISOString(),
    })
    .eq("vrNumber", vrNumber)
    .select()
    .single();

  if (updateError) {
    console.error(`❌ Error updating ${vrNumber}:`, updateError);
    process.exit(1);
  }

  if (updated) {
    console.log(`✅ Updated delivery record for ${vrNumber}`);
    console.log(`   Status: ${updated.status}`);
    console.log(`   Delivered At: ${new Date(updated.deliveredAt).toLocaleString("en-US", { timeZone: "America/Phoenix" })}`);
    console.log(`   Delivered By: ${updated.deliveredBy}`);
    console.log(`   Notes: ${updated.notes}`);
  } else {
    console.log(`⚠️  No record found for ${vrNumber}. Creating new record...`);
    
    const { data: created, error: createError } = await supabase
      .from("wd_delivery_records")
      .insert({
        id: randomUUID(),
        vrNumber: vrNumber,
        loadNumber: 0,
        status: "delivered",
        tonnage: 20,
        scheduledDate: deliveredDate.toISOString(),
        deliveredAt: deliveredDate.toISOString(),
        deliveredBy: "Field Team",
        notes: "Tyson Tolleson, AZ delivery - separate from Nestle loads. ETA: 14:30. Delivered on 12/18/2025.",
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
      console.log(`✅ Created delivery record for ${vrNumber} as delivered`);
    }
  }

  console.log("\n✨ Done! The Tyson delivery is now marked as delivered in the calendar.");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  });

