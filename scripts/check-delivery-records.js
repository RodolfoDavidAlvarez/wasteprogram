// Check delivery records in database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://govktyrtmwzbzqkmzmrf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvdmt0eXJ0bXd6Ynpxa216bXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2OTU2NiwiZXhwIjoyMDcwMzQ1NTY2fQ.Zf6HI1O9ROsRersiYukXzwznHVXALs2EDYiSGLchyVI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDeliveryRecords() {
  console.log('📋 Checking delivery records (wd_delivery_records)...\n');

  // Get all delivery records
  const { data: records, error } = await supabase
    .from('wd_delivery_records')
    .select('*')
    .order('scheduledDate', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${records?.length || 0} delivery records:\n`);

  if (records && records.length > 0) {
    records.forEach((record, i) => {
      const photoUrls = record.photoUrls ? JSON.parse(record.photoUrls) : [];
      console.log(`${i + 1}. VR#: ${record.vrNumber}`);
      console.log(`   Date: ${record.scheduledDate}`);
      console.log(`   Status: ${record.status}`);
      console.log(`   Load#: ${record.loadNumber}`);
      console.log(`   Tonnage: ${record.tonnage || 'N/A'} tons`);
      console.log(`   Photos: ${photoUrls.length}`);
      if (photoUrls.length > 0) {
        photoUrls.forEach((url, j) => {
          console.log(`      - ${url}`);
        });
      }
      console.log('');
    });
  } else {
    console.log('No delivery records found in database.');
  }
}

checkDeliveryRecords().catch(console.error);
