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
  console.log("Updating delivery records for TODAY - Monday, December 22, 2025\n");

  // Today is Monday, December 22, 2025
  // Set to start of day in Arizona timezone (UTC-7) - 7:00 AM UTC = 12:00 AM Arizona
  const todayStart = new Date("2025-12-22T07:00:00.000Z"); // 12:00 AM Arizona time
  const todayEnd = new Date("2025-12-23T07:00:00.000Z");   // 12:00 AM next day Arizona time

  console.log(`Date range for today (Arizona time):`);
  console.log(`  Start: ${todayStart.toISOString()} (${new Date(todayStart).toLocaleString("en-US", { timeZone: "America/Phoenix" })})`);
  console.log(`  End: ${todayEnd.toISOString()} (${new Date(todayEnd).toLocaleString("en-US", { timeZone: "America/Phoenix" })})`);
  console.log();

  // Query for today's delivery records
  const { data: records, error } = await supabase
    .from("wd_delivery_records")
    .select("*")
    .gte("scheduledDate", todayStart.toISOString())
    .lt("scheduledDate", todayEnd.toISOString())
    .order("scheduledDate", { ascending: true });

  if (error) {
    console.error("Error fetching records:", error);
    process.exit(1);
  }

  console.log(`Found ${records?.length || 0} existing record(s) for today:\n`);
  
  if (records && records.length > 0) {
    records.forEach((r, i) => {
      const scheduledDate = new Date(r.scheduledDate);
      console.log(`${i + 1}. VR#: ${r.vrNumber}`);
      console.log(`   Status: ${r.status}`);
      console.log(`   Scheduled: ${scheduledDate.toLocaleString("en-US", { timeZone: "America/Phoenix" })}`);
      console.log(`   Notes: ${r.notes || "(none)"}\n`);
    });
  }

  const notes = "Ensure we take the empty and full weight. Also take photos of the license plate.";

  // For Monday 12/22, we need 2 trucks
  // Using VR numbers that match the schedule pattern
  const targetVrNumbers = ["PENDING-1222-1", "PENDING-1222-2"];
  
  console.log(`📝 Ensuring 2 truck records exist with proper notes...\n`);

  // Update or create records for the 2 trucks
  for (let i = 0; i < 2; i++) {
    const vrNumber = targetVrNumbers[i];
    
    // Check if record exists
    const existingRecord = records?.find((r) => r.vrNumber === vrNumber);

    if (existingRecord) {
      // Update existing record
      const needsUpdate = existingRecord.notes !== notes || 
                         existingRecord.status !== "scheduled" ||
                         new Date(existingRecord.scheduledDate).toISOString() !== todayStart.toISOString();

      if (needsUpdate) {
        console.log(`Updating record for ${vrNumber}...`);
        const { data: updated, error: updateError } = await supabase
          .from("wd_delivery_records")
          .update({
            notes: notes,
            status: "scheduled",
            scheduledDate: todayStart.toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .eq("vrNumber", vrNumber)
          .select()
          .single();

        if (updateError) {
          console.error(`❌ Error updating ${vrNumber}:`, updateError);
        } else {
          console.log(`✅ Updated ${vrNumber}`);
          console.log(`   Notes: ${updated.notes}`);
          console.log(`   Status: ${updated.status}`);
          console.log(`   Scheduled: ${new Date(updated.scheduledDate).toLocaleString("en-US", { timeZone: "America/Phoenix" })}\n`);
        }
      } else {
        console.log(`✓ ${vrNumber} is already correctly configured\n`);
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
          scheduledDate: todayStart.toISOString(),
          notes: notes,
          photoUrls: "[]",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error(`❌ Error creating ${vrNumber}:`, createError);
      } else {
        console.log(`✅ Created ${vrNumber}`);
        console.log(`   Notes: ${created.notes}`);
        console.log(`   Status: ${created.status}`);
        console.log(`   Scheduled: ${new Date(created.scheduledDate).toLocaleString("en-US", { timeZone: "America/Phoenix" })}\n`);
      }
    }
  }

  // Final summary
  console.log(`\n📋 Final Summary for Monday, December 22, 2025:\n`);
  const { data: finalRecords, error: finalError } = await supabase
    .from("wd_delivery_records")
    .select("*")
    .gte("scheduledDate", todayStart.toISOString())
    .lt("scheduledDate", todayEnd.toISOString())
    .in("vrNumber", targetVrNumbers)
    .order("vrNumber", { ascending: true });

  if (!finalError && finalRecords) {
    console.log(`✅ ${finalRecords.length} truck record(s) configured:\n`);
    finalRecords.forEach((r, i) => {
      const scheduledDate = new Date(r.scheduledDate);
      console.log(`Truck ${i + 1}:`);
      console.log(`  VR#: ${r.vrNumber}`);
      console.log(`  Status: ${r.status}`);
      console.log(`  Scheduled: ${scheduledDate.toLocaleString("en-US", { timeZone: "America/Phoenix" })}`);
      console.log(`  Notes: ${r.notes}`);
      console.log();
    });
  }

  console.log("✨ Database updated for today's 2 truck loads!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  });


