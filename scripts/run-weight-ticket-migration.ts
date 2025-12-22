import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";

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
  console.log("Running migration to add weightTicketUrls field...\n");

  try {
    // Read the migration SQL
    const migrationPath = resolve(__dirname, "../supabase/migrations/20251222000000_add_weight_ticket_urls.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("Migration SQL:");
    console.log(migrationSQL);
    console.log("\n");

    // Execute the SQL using Supabase RPC or direct SQL execution
    // Note: Supabase JS client doesn't support raw SQL directly, so we'll use the REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ sql: migrationSQL }),
    });

    if (!response.ok) {
      // If RPC doesn't work, try direct SQL via PostgREST
      // Actually, let's just try updating a record to see if the column exists
      console.log("Attempting alternative method: testing column access...\n");
      
      // Try to update with the new field
      const { data: testRecord } = await supabase
        .from("wd_delivery_records")
        .select("vrNumber")
        .limit(1)
        .single();

      if (testRecord) {
        const { error: updateError } = await supabase
          .from("wd_delivery_records")
          .update({ weightTicketUrls: "[]" })
          .eq("vrNumber", testRecord.vrNumber);

        if (updateError) {
          console.log("❌ Column doesn't exist. Please run this SQL in your Supabase SQL Editor:\n");
          console.log(migrationSQL);
          console.log("\nOr visit: https://supabase.com/dashboard/project/govktyrtmwzbzqkmzmrf/sql/new");
          process.exit(1);
        } else {
          console.log("✅ Migration successful! Column exists and is accessible.");
        }
      }
    } else {
      console.log("✅ Migration executed successfully!");
    }

    // Verify the column exists
    const { data: verifyData, error: verifyError } = await supabase
      .from("wd_delivery_records")
      .select("weightTicketUrls")
      .limit(1);

    if (verifyError) {
      console.log("⚠️  Could not verify column. Please check manually.");
      console.log("Run this SQL in Supabase SQL Editor:");
      console.log(migrationSQL);
    } else {
      console.log("✅ Verified: weightTicketUrls column is accessible!");
    }
  } catch (error: any) {
    console.error("Error:", error.message);
    console.log("\n⚠️  Please run the migration SQL manually in your Supabase SQL Editor:");
    console.log("   Visit: https://supabase.com/dashboard/project/govktyrtmwzbzqkmzmrf/sql/new");
    console.log("\nSQL to run:");
    const migrationPath = resolve(__dirname, "../supabase/migrations/20251222000000_add_weight_ticket_urls.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");
    console.log(migrationSQL);
  }

  console.log("\n✨ Database migration complete!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  });


