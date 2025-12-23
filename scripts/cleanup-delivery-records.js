// Cleanup delivery records - remove extra/invalid records
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://govktyrtmwzbzqkmzmrf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvdmt0eXJ0bXd6Ynpxa216bXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2OTU2NiwiZXhwIjoyMDcwMzQ1NTY2fQ.Zf6HI1O9ROsRersiYukXzwznHVXALs2EDYiSGLchyVI'
);

async function cleanup() {
  console.log('🧹 Cleaning up delivery records...\n');

  // Records to remove:
  // 1. 121825-90 - has no load number, wasn't validated
  // 2. PENDING-1222-1 and PENDING-1222-2 - these are placeholders

  const toDelete = ['121825-90', 'PENDING-1222-1', 'PENDING-1222-2'];

  for (const vrNumber of toDelete) {
    const { error } = await supabase
      .from('wd_delivery_records')
      .delete()
      .eq('vrNumber', vrNumber);

    if (error) {
      console.error(`❌ Error deleting ${vrNumber}:`, error.message);
    } else {
      console.log(`✅ Deleted ${vrNumber}`);
    }
  }

  console.log('\n--- FINAL RECORDS ---\n');

  // List remaining records
  const { data, error } = await supabase
    .from('wd_delivery_records')
    .select('vrNumber, loadNumber, scheduledDate, tonnage, status, photoUrls')
    .order('scheduledDate', { ascending: true })
    .order('loadNumber', { ascending: true });

  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  // Vanguard Loads
  console.log('VANGUARD LOADS (11 expected):');
  const vanguard = data.filter(r => !r.vrNumber.startsWith('BOL-'));
  vanguard.forEach((r, i) => {
    const photos = r.photoUrls ? JSON.parse(r.photoUrls).length : 0;
    console.log(`  ${i + 1}. #${r.loadNumber || '?'}: ${r.vrNumber} - ${r.tonnage.toFixed(2)} tons - ${photos} photos`);
  });
  console.log(`  Total: ${vanguard.length} loads, ${vanguard.reduce((s,r) => s+r.tonnage, 0).toFixed(2)} tons`);

  // Outbound
  console.log('\nOUTBOUND LOADS (Jack/3LAG):');
  const outbound = data.filter(r => r.vrNumber.startsWith('BOL-'));
  outbound.forEach((r, i) => {
    const photos = r.photoUrls ? JSON.parse(r.photoUrls).length : 0;
    console.log(`  ${i + 1}. ${r.vrNumber} - ${r.tonnage.toFixed(2)} tons - ${photos} photos`);
  });
  console.log(`  Total: ${outbound.length} loads, ${outbound.reduce((s,r) => s+r.tonnage, 0).toFixed(2)} tons`);

  console.log('\n' + '='.repeat(60));
  console.log('REVENUE SUMMARY:');
  const vanguardTons = vanguard.reduce((s,r) => s+r.tonnage, 0);
  const outboundTons = outbound.reduce((s,r) => s+r.tonnage, 0);
  console.log(`  Vanguard: ${vanguardTons.toFixed(2)} tons × $45/ton = $${(vanguardTons * 45).toFixed(2)}`);
  console.log(`  Outbound: ${outboundTons.toFixed(2)} tons × $20/ton = $${(outboundTons * 20).toFixed(2)}`);
  console.log(`  TOTAL: $${(vanguardTons * 45 + outboundTons * 20).toFixed(2)}`);
}

cleanup().catch(console.error);
