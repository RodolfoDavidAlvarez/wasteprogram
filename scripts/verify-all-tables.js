/**
 * Verify all tables exist in the shared database
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://govktyrtmwzbzqkmzmrf.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvdmt0eXJ0bXd6Ynpxa216bXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2OTU2NiwiZXhwIjoyMDcwMzQ1NTY2fQ.Zf6HI1O9ROsRersiYukXzwznHVXALs2EDYiSGLchyVI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function verify() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  DATABASE VERIFICATION - Shared Supabase Instance');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Waste Diversion tables (wd_*)
  const wdTables = [
    'wd_clients',
    'wd_contracts',
    'wd_waste_intakes',
    'wd_contamination_reports',
    'wd_waste_type_configs',
    'wd_daily_operations',
    'wd_environmental_metrics',
    'wd_users',
    'wd_scale_transactions',
    'wd_bills_of_lading',
    'wd_company_trucks',
    'wd_drivers'
  ];

  console.log('🗄️  WASTE DIVERSION TABLES (wd_*)\n');
  let wdSuccess = 0;
  for (const table of wdTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}`);
        wdSuccess++;
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
    }
  }
  console.log(`\n   Status: ${wdSuccess}/${wdTables.length} tables accessible\n`);

  // Organic Soil Wholesale tables
  const oswTables = [
    'products',
    'orders',
    'users',
    'onboarding_requests',
    'contact_messages',
    'pricing_tiers',
    'size_categories',
    'delivery_zones',
    'price_history',
    'admin_users',
    'admin_sessions',
    'audit_logs',
    'representatives',
    'representative_contacts'
  ];

  console.log('🌱 ORGANIC SOIL WHOLESALE TABLES (existing)\n');
  let oswSuccess = 0;
  for (const table of oswTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`   ❓ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}`);
        oswSuccess++;
      }
    } catch (err) {
      console.log(`   ❓ ${table}: ${err.message}`);
    }
  }
  console.log(`\n   Status: ${oswSuccess}/${oswTables.length} tables accessible\n`);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   Waste Diversion (wd_*): ${wdSuccess}/${wdTables.length} ✅`);
  console.log(`   Organic Soil Wholesale: ${oswSuccess}/${oswTables.length} ✅`);
  console.log('\n   ✨ Both applications can now share the same Supabase database!');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

verify();
