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
  console.log("Updating BOL delivery records with correct weights...\n");

  // Weight ticket data from the PDFs
  const weightTickets = [
    {
      vrNumber: "BOL-121925-01",
      netWeightLbs: 38540,
      netWeightTons: 19.27,
      ticketNumber: "121925-01",
      truckNumber: "4UH4601",
      trailerNumber: "141359",
    },
    {
      vrNumber: "BOL-121925-02",
      netWeightLbs: 35220,
      netWeightTons: 17.61,
      ticketNumber: "121925-02",
      truckNumber: "4NC8490",
      trailerNumber: null,
    },
  ];

  for (const ticket of weightTickets) {
    console.log(`Updating ${ticket.vrNumber}...`);
    console.log(`  Net Weight: ${ticket.netWeightTons} tons (${ticket.netWeightLbs.toLocaleString()} lbs)`);

    const { data: updated, error: updateError } = await supabase
      .from("wd_delivery_records")
      .update({
        tonnage: ticket.netWeightTons,
        notes: `eco Truck ${ticket.truckNumber}${ticket.trailerNumber ? ` (Trailer ${ticket.trailerNumber})` : ""} → Robinson Calf Ranch. Net: ${ticket.netWeightLbs.toLocaleString()} lbs (${ticket.netWeightTons} tons). Scale Operator: SC`,
        updatedAt: new Date().toISOString(),
      })
      .eq("vrNumber", ticket.vrNumber)
      .select()
      .single();

    if (updateError) {
      console.error(`❌ Error updating ${ticket.vrNumber}:`, updateError);
    } else {
      console.log(`✅ Updated ${ticket.vrNumber}`);
      console.log(`   Tonnage: ${updated.tonnage} tons`);
      console.log(`   Notes: ${updated.notes}\n`);
    }
  }

  console.log("✨ Done!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  });


