// Add Dec 22 outbound loads to Jack/3LAG
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  'https://govktyrtmwzbzqkmzmrf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvdmt0eXJ0bXd6Ynpxa216bXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2OTU2NiwiZXhwIjoyMDcwMzQ1NTY2fQ.Zf6HI1O9ROsRersiYukXzwznHVXALs2EDYiSGLchyVI'
);

function generateCuid() {
  return 'c' + crypto.randomBytes(12).toString('hex');
}

// Dec 22, 2025 outbound loads from weigh tickets
const newLoads = [
  {
    vrNumber: 'BOL-122225-03',
    loadNumber: 3,
    ticketNumber: 'WT-251222-KTMB',
    scheduledDate: '2025-12-22',
    tonnage: 17.98,
    netWeightLbs: 35960,
    truckPlate: '467297T',
    status: 'delivered'
  },
  {
    vrNumber: 'BOL-122225-04',
    loadNumber: 4,
    ticketNumber: 'WT-251222-JCSB',
    scheduledDate: '2025-12-22',
    tonnage: 19.04,
    netWeightLbs: 38080,
    truckPlate: '467297T',
    driverName: 'Yarendis',
    status: 'delivered'
  }
];

async function addLoads() {
  console.log('📦 Adding Dec 22 outbound loads to Jack/3LAG...\n');

  for (const load of newLoads) {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('wd_delivery_records')
      .insert({
        id: generateCuid(),
        vrNumber: load.vrNumber,
        loadNumber: load.loadNumber,
        scheduledDate: load.scheduledDate,
        tonnage: load.tonnage,
        status: load.status,
        deliveredAt: now,
        createdAt: now,
        updatedAt: now,
        notes: JSON.stringify({
          ticketNumber: load.ticketNumber,
          netWeightLbs: load.netWeightLbs,
          truckPlate: load.truckPlate,
          driverName: load.driverName || null,
          materialType: 'Waste',
          destination: 'Robinson Calf Ranch, 1001 East Hosking Avenue, Bakersfield CA 93307',
          source: 'Weigh Ticket'
        })
      });

    if (error) {
      console.error(`❌ Error adding ${load.vrNumber}:`, error.message);
    } else {
      console.log(`✅ Added ${load.vrNumber}: ${load.netWeightLbs.toLocaleString()} lbs (${load.tonnage} tons)`);
    }
  }

  // List all outbound records
  console.log('\n--- ALL OUTBOUND LOADS (Jack/3LAG) ---\n');

  const { data, error } = await supabase
    .from('wd_delivery_records')
    .select('vrNumber, scheduledDate, tonnage, notes')
    .like('vrNumber', 'BOL-%')
    .order('scheduledDate', { ascending: true });

  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  let totalTons = 0;
  data.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.vrNumber} | ${r.scheduledDate} | ${r.tonnage.toFixed(2)} tons | ${(r.tonnage * 2000).toLocaleString()} lbs`);
    totalTons += r.tonnage;
  });

  console.log('\n' + '='.repeat(60));
  console.log(`TOTAL: ${data.length} loads | ${totalTons.toFixed(2)} tons | ${(totalTons * 2000).toLocaleString()} lbs`);
  console.log(`REVENUE @ $20/ton: $${(totalTons * 20).toFixed(2)}`);
}

addLoads().catch(console.error);
