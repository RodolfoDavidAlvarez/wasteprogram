const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://govktyrtmwzbzqkmzmrf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvdmt0eXJ0bXd6Ynpxa216bXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2OTU2NiwiZXhwIjoyMDcwMzQ1NTY2fQ.Zf6HI1O9ROsRersiYukXzwznHVXALs2EDYiSGLchyVI'
);

async function listRecords() {
  const { data, error } = await supabase
    .from('wd_delivery_records')
    .select('vrNumber, loadNumber, scheduledDate, tonnage, status, photoUrls, notes')
    .order('scheduledDate', { ascending: true })
    .order('loadNumber', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== ALL DELIVERY RECORDS ===\n');

  // Vanguard Loads (not BOL- or PENDING-)
  console.log('VANGUARD LOADS (Incoming @ $45/ton):');
  const vanguard = data.filter(r => !r.vrNumber.startsWith('BOL-') && !r.vrNumber.startsWith('PENDING-'));
  vanguard.forEach(r => {
    const photos = r.photoUrls ? JSON.parse(r.photoUrls).length : 0;
    const amount = (r.tonnage * 45).toFixed(2);
    console.log(`  #${r.loadNumber || '?'}: ${r.vrNumber.padEnd(12)} | ${r.tonnage.toFixed(2).padStart(6)} tons | ${(r.tonnage * 2000).toLocaleString().padStart(8)} lbs | ${photos} photos | $${amount} | ${r.status}`);
  });
  const vanguardTons = vanguard.reduce((s,r) => s+r.tonnage, 0);
  console.log(`  ${'─'.repeat(80)}`);
  console.log(`  SUBTOTAL: ${vanguardTons.toFixed(2)} tons | ${(vanguardTons * 2000).toLocaleString()} lbs | $${(vanguardTons * 45).toFixed(2)}\n`);

  // Outbound BOL Loads (to Jack @ $20/ton)
  console.log('OUTBOUND LOADS to 3LAG/Jack (@ $20/ton):');
  const outbound = data.filter(r => r.vrNumber.startsWith('BOL-'));
  outbound.forEach(r => {
    const photos = r.photoUrls ? JSON.parse(r.photoUrls).length : 0;
    const amount = (r.tonnage * 20).toFixed(2);
    console.log(`  ${r.vrNumber.padEnd(20)} | ${r.tonnage.toFixed(2).padStart(6)} tons | ${(r.tonnage * 2000).toLocaleString().padStart(8)} lbs | ${photos} photos | $${amount} | ${r.status}`);
  });
  const outboundTons = outbound.reduce((s,r) => s+r.tonnage, 0);
  console.log(`  ${'─'.repeat(80)}`);
  console.log(`  SUBTOTAL: ${outboundTons.toFixed(2)} tons | ${(outboundTons * 2000).toLocaleString()} lbs | $${(outboundTons * 20).toFixed(2)}\n`);

  // Pending
  console.log('PENDING / UNCONFIRMED:');
  const pending = data.filter(r => r.vrNumber.startsWith('PENDING-'));
  pending.forEach(r => {
    console.log(`  ${r.vrNumber} - ${r.tonnage.toFixed(2)} tons - ${r.status}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY:');
  console.log(`  Vanguard loads: ${vanguard.length} (expected: 11)`);
  console.log(`  Outbound loads: ${outbound.length} (expected: 4)`);
  console.log(`  Pending loads:  ${pending.length}`);
  console.log(`  TOTAL RECORDS:  ${data.length}`);
  console.log('\nREVENUE:');
  console.log(`  Vanguard @ $45/ton: ${vanguardTons.toFixed(2)} tons × $45 = $${(vanguardTons * 45).toFixed(2)}`);
  console.log(`  Outbound @ $20/ton: ${outboundTons.toFixed(2)} tons × $20 = $${(outboundTons * 20).toFixed(2)}`);
  console.log(`  GRAND TOTAL: $${(vanguardTons * 45 + outboundTons * 20).toFixed(2)}`);
}

listRecords().catch(console.error);
