/**
 * Waste Diversion App - Database Migration Script
 *
 * This script creates the wd_* tables in the shared Supabase database.
 * It uses the Supabase client to execute SQL directly, avoiding
 * the connection issues with Prisma's pooler connection.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://govktyrtmwzbzqkmzmrf.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvdmt0eXJ0bXd6Ynpxa216bXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2OTU2NiwiZXhwIjoyMDcwMzQ1NTY2fQ.Zf6HI1O9ROsRersiYukXzwznHVXALs2EDYiSGLchyVI';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting Waste Diversion database migration...\n');

  // Read the migration SQL
  const migrationPath = path.join(__dirname, '..', 'prisma', 'migration.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Split into individual statements (split on semicolons not inside strings)
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 60).replace(/\n/g, ' ');

    try {
      console.log(`⚡ [${i + 1}/${statements.length}] ${preview}...`);

      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Check if it's just a "table already exists" error
        if (error.message?.includes('already exists')) {
          console.log(`   ⏭️  Skipped (already exists)`);
          successCount++;
        } else {
          console.error(`   ❌ Error: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`   ✅ Success`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`   ❌ Exception: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('='.repeat(50));

  // Verify the tables were created
  console.log('\n🔍 Verifying wd_* tables...\n');

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

  for (const table of wdTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table}: Not accessible - ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK`);
      }
    } catch (err: any) {
      console.log(`❌ ${table}: Exception - ${err.message}`);
    }
  }

  console.log('\n✨ Migration complete!');
}

runMigration().catch(console.error);
