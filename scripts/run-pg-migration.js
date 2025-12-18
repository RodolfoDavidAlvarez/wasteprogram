/**
 * Waste Diversion App - Database Migration Script (PostgreSQL)
 *
 * This script creates the wd_* tables in the shared Supabase database.
 * Uses direct PostgreSQL connection via pg package.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Session mode connection (port 6543) for migrations
// This URL format works better for schema changes
const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://postgres.govktyrtmwzbzqkmzmrf:vatbur-musfar-Puzbu8@aws-0-us-west-1.pooler.supabase.com:6543/postgres';

async function runMigration() {
  console.log('🚀 Starting Waste Diversion database migration...\n');
  console.log('📡 Connecting to Supabase PostgreSQL...');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read the migration SQL
    const migrationPath = path.join(__dirname, '..', 'prisma', 'migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Split into individual statements
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 60).replace(/\n/g, ' ');

      try {
        process.stdout.write(`⚡ [${i + 1}/${statements.length}] ${preview}...`);

        await client.query(statement);
        console.log(' ✅');
        successCount++;
      } catch (err) {
        // Check if it's just a "table already exists" error
        if (err.message?.includes('already exists') || err.code === '42P07') {
          console.log(' ⏭️  (exists)');
          skippedCount++;
        } else if (err.message?.includes('duplicate key') || err.code === '23505') {
          console.log(' ⏭️  (duplicate)');
          skippedCount++;
        } else {
          console.log(` ❌ ${err.message}`);
          errorCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
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
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ ${table}: OK (${result.rows[0].count} rows)`);
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

    // Also verify OSW tables still exist
    console.log('\n🔍 Verifying existing Organic Soil Wholesale tables are intact...\n');

    const oswTables = ['products', 'orders', 'users', 'admin_users'];
    for (const table of oswTables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ ${table}: OK (${result.rows[0].count} rows)`);
      } catch (err) {
        console.log(`❓ ${table}: ${err.message}`);
      }
    }

    console.log('\n✨ Migration complete!');

  } catch (err) {
    console.error('💥 Connection error:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
