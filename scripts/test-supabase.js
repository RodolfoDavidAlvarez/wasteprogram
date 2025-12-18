/**
 * Test Supabase connection
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://govktyrtmwzbzqkmzmrf.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvdmt0eXJ0bXd6Ynpxa216bXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2OTU2NiwiZXhwIjoyMDcwMzQ1NTY2fQ.Zf6HI1O9ROsRersiYukXzwznHVXALs2EDYiSGLchyVI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function test() {
  console.log('🔍 Testing Supabase connection...\n');

  // Try to list tables via information_schema
  console.log('📋 Checking existing tables...');

  try {
    // Try to query a known OSW table
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .limit(3);

    if (error) {
      console.log('❌ Error querying products:', error.message);
    } else {
      console.log('✅ Found products table with', data?.length, 'sample rows');
      if (data?.length > 0) {
        console.log('   Sample:', data.map(p => p.name).join(', '));
      }
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }

  // Try to create a test table using raw SQL
  console.log('\n📝 Attempting to create test table via SQL...');

  try {
    // First check if wd_test exists
    const { data: testData, error: testError } = await supabase
      .from('wd_test')
      .select('*')
      .limit(1);

    if (!testError) {
      console.log('✅ wd_test table already exists');
    } else {
      console.log('   wd_test does not exist yet:', testError.message);
    }
  } catch (err) {
    console.log('   Exception checking wd_test:', err.message);
  }

  // Check wd_clients table
  console.log('\n📝 Checking if wd_clients exists...');
  try {
    const { data, error } = await supabase
      .from('wd_clients')
      .select('*')
      .limit(1);

    if (!error) {
      console.log('✅ wd_clients table exists!');
    } else {
      console.log('❌ wd_clients does not exist:', error.message);
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }

  console.log('\n✅ Supabase connection test complete');
}

test();
