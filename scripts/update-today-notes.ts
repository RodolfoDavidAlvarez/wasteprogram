import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { randomUUID } from "crypto";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

// Use environment variables or fallback to hardcoded values (from test-supabase.js)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://govktyrtmwzbzqkmzmrf.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvdmt0eXJ0bXd6Ynpxa216bXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2OTU2NiwiZXhwIjoyMDcwMzQ1NTY2fQ.Zf6HI1O9ROsRersiYukXzwznHVXALs2EDYiSGLchyVI";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("Updating notes for today's truck loads...");

  // Today is Monday, December 22, 2025
  // Set to start of day in Arizona timezone (UTC-7)
  const today = new Date("2025-12-22T00:00:00-07:00");
  const tomorrow = new Date("2025-12-23T00:00:00-07:00");

  console.log(`Looking for records scheduled on: ${today.toISOString()}`);

  // Query for today's delivery records
  const { data: records, error } = await supabase
    .from("wd_delivery_records")
    .select("*")
    .gte("scheduledDate", today.toISOString())
    .lt("scheduledDate", tomorrow.toISOString())
    .order("scheduledDate", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Error fetching records:", error);
    process.exit(1);
  }

  console.log(`Found ${records?.length || 0} records for today`);

  // If we have less than 2 records, we need to create them
  // Based on the schedule, Monday 12/22 has 3 loads, but user says 2 trucks
  // We'll use placeholder VR numbers for the first 2 loads
  const vrNumbers = ["PENDING-1222-1", "PENDING-1222-2"];

  const notes = "Ensure we take the empty and full weight. Also take photos of the license plate.";

  // Update or create records for the 2 trucks
  for (let i = 0; i < 2; i++) {
    const vrNumber = vrNumbers[i];
    
    // Check if record exists
    const existingRecord = records?.find((r) => r.vrNumber === vrNumber);

    if (existingRecord) {
      // Update existing record
      console.log(`Updating record for ${vrNumber}...`);
      const { data: updated, error: updateError } = await supabase
        .from("wd_delivery_records")
        .update({
          notes: notes,
          updatedAt: new Date().toISOString(),
        })
        .eq("vrNumber", vrNumber)
        .select()
        .single();

      if (updateError) {
        console.error(`Error updating ${vrNumber}:`, updateError);
      } else {
        console.log(`✅ Updated ${vrNumber} with notes`);
      }
    } else {
      // Create new record
      console.log(`Creating record for ${vrNumber}...`);
      const { data: created, error: createError } = await supabase
        .from("wd_delivery_records")
        .insert({
          id: randomUUID(),
          vrNumber: vrNumber,
          loadNumber: i + 1,
          status: "scheduled",
          tonnage: 20,
          scheduledDate: today.toISOString(),
          notes: notes,
          photoUrls: "[]",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error(`Error creating ${vrNumber}:`, createError);
      } else {
        console.log(`✅ Created ${vrNumber} with notes`);
      }
    }
  }

  // Also update any existing records that match today's date (in case VR numbers are different)
  if (records && records.length > 0) {
    console.log("\nUpdating existing records for today...");
    for (let i = 0; i < Math.min(2, records.length); i++) {
      const record = records[i];
      if (record.vrNumber && !vrNumbers.includes(record.vrNumber)) {
        console.log(`Updating record ${record.vrNumber}...`);
        const { error: updateError } = await supabase
          .from("wd_delivery_records")
          .update({
            notes: notes,
            updatedAt: new Date().toISOString(),
          })
          .eq("vrNumber", record.vrNumber);

        if (updateError) {
          console.error(`Error updating ${record.vrNumber}:`, updateError);
        } else {
          console.log(`✅ Updated ${record.vrNumber} with notes`);
        }
      }
    }
  }

  console.log("\n✨ Done updating today's truck load notes!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  });

