// Update delivery records with actual weights from MLT forms
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://govktyrtmwzbzqkmzmrf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvdmt0eXJ0bXd6Ynpxa216bXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2OTU2NiwiZXhwIjoyMDcwMzQ1NTY2fQ.Zf6HI1O9ROsRersiYukXzwznHVXALs2EDYiSGLchyVI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Actual weights from MLT forms (in lbs)
const actualWeights = {
  '121125-109': { lbs: 40850, tons: 20.425, trailer: '2025', seal: '48440594' },
  '121125-110': { lbs: 37964, tons: 18.982, trailer: '2002', seal: '48440600' },
  '121225-98':  { lbs: 40500, tons: 20.25, trailer: '2903', seal: '48440553' },
  '121525-49':  { lbs: 40850, tons: 20.425, trailer: '141300', seal: '48440921' },
  '121025-117': { lbs: 39877, tons: 19.9385, trailer: '5768', seal: '48440666' },
  '121625-45':  { lbs: 40500, tons: 20.25, trailer: '60570', seal: '48440057' },
  '121725-41':  { lbs: 39211, tons: 19.6055, trailer: '1091', seal: '48445972' },
  '121725-72':  { lbs: 41000, tons: 20.5, trailer: '116', seal: '48445971' },
  '121525-50':  { lbs: 40819, tons: 20.4095, trailer: '1528', seal: '48444599' },
};

async function updateWeights() {
  console.log('📊 Updating delivery records with actual weights...\n');

  let totalLbs = 0;
  let totalTons = 0;
  let updatedCount = 0;

  for (const [vrNumber, data] of Object.entries(actualWeights)) {
    const { error } = await supabase
      .from('wd_delivery_records')
      .update({
        tonnage: data.tons,
        notes: JSON.stringify({
          netWeightLbs: data.lbs,
          trailerNumber: data.trailer,
          sealNumber: data.seal,
          materialType: 'Contaminated Kibble (Dog Food)',
          source: 'Flagstaff MLT Form'
        }),
        updatedAt: new Date().toISOString()
      })
      .eq('vrNumber', vrNumber);

    if (error) {
      console.error(`❌ Error updating ${vrNumber}:`, error.message);
    } else {
      console.log(`✅ Updated VR ${vrNumber}: ${data.lbs.toLocaleString()} lbs (${data.tons.toFixed(2)} tons)`);
      totalLbs += data.lbs;
      totalTons += data.tons;
      updatedCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY OF DOCUMENTED VANGUARD LOADS');
  console.log('='.repeat(60));
  console.log(`Records updated: ${updatedCount}`);
  console.log(`Total weight: ${totalLbs.toLocaleString()} lbs`);
  console.log(`Total tonnage: ${totalTons.toFixed(2)} tons`);
  console.log('');

  // Get records without photos (121225-99, 121825-74)
  console.log('📋 Records WITHOUT documentation photos:');
  console.log('   - VR 121225-99 (Dec 12, Load #4) - No photo, no weight');
  console.log('   - VR 121825-74 (Dec 18, Load #11) - No photo, scheduled');
  console.log('');

  // Tolleson/Tyson load
  console.log('📦 ADDITIONAL LOAD (Tolleson/Tyson Foods):');
  console.log('   - BOL# 0024140830');
  console.log('   - Date: Dec 18, 2025');
  console.log('   - Net Weight: 15,578.55 lbs (7.79 tons)');
  console.log('   - Material: Mixed Tyson meat products');
  console.log('');

  // Estimate for missing loads (average of documented)
  const avgTons = totalTons / updatedCount;
  const estimatedMissingTons = avgTons * 2; // 2 missing records
  console.log(`📈 ESTIMATED TOTALS:`);
  console.log(`   Average weight per load: ${(totalLbs / updatedCount).toLocaleString()} lbs (${avgTons.toFixed(2)} tons)`);
  console.log(`   Documented loads (9): ${totalTons.toFixed(2)} tons`);
  console.log(`   Estimated missing (2 loads): ${estimatedMissingTons.toFixed(2)} tons`);
  console.log(`   Tolleson/Tyson: 7.79 tons`);
  console.log('   ' + '-'.repeat(40));
  console.log(`   ESTIMATED GRAND TOTAL: ${(totalTons + estimatedMissingTons + 7.79).toFixed(2)} tons`);
}

updateWeights().catch(console.error);
