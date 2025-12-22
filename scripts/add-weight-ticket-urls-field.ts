import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

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
  console.log("Adding weightTicketUrls field to delivery records table...\n");

  try {
    // Check if column already exists by trying to select it
    const { data: testData, error: testError } = await supabase
      .from("wd_delivery_records")
      .select("weightTicketUrls")
      .limit(1);

    if (!testError) {
      console.log("✅ weightTicketUrls field already exists in the table");
      return;
    }

    // If column doesn't exist, we need to add it via SQL
    // Since we can't run raw SQL directly, we'll use RPC if available, or just note that migration is needed
    console.log("⚠️  Column doesn't exist yet. Please run the migration SQL manually:");
    console.log("\nALTER TABLE \"wd_delivery_records\" ADD COLUMN IF NOT EXISTS \"weightTicketUrls\" TEXT;");
    console.log("\nOr the migration file is at:");
    console.log("supabase/migrations/20251222000000_add_weight_ticket_urls.sql\n");

    // For now, let's try to work around by checking if we can insert/update with the field
    // This will work if the column exists, or fail gracefully if it doesn't
    console.log("Attempting to verify field access...");
    
    // Try to update a record with empty weightTicketUrls to test
    const { data: records } = await supabase
      .from("wd_delivery_records")
      .select("vrNumber")
      .limit(1);

    if (records && records.length > 0) {
      const testVr = records[0].vrNumber;
      const { error: updateError } = await supabase
        .from("wd_delivery_records")
        .update({ weightTicketUrls: "[]" })
        .eq("vrNumber", testVr);

      if (updateError) {
        console.log("❌ Field doesn't exist. Please run the migration:");
        console.log("   Run the SQL in: supabase/migrations/20251222000000_add_weight_ticket_urls.sql");
        process.exit(1);
      } else {
        console.log("✅ Field exists and is accessible!");
      }
    }
  } catch (error) {
    console.error("Error:", error);
    console.log("\n⚠️  Please run the migration SQL manually in your Supabase dashboard:");
    console.log("   ALTER TABLE \"wd_delivery_records\" ADD COLUMN IF NOT EXISTS \"weightTicketUrls\" TEXT;");
    process.exit(1);
  }

  console.log("\n✨ Database is ready for weight ticket uploads!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  });


