/**
 * 🚀 COMPLETE DATA MIGRATION SCRIPT
 * 
 * This script migrates ALL data from old Railway database to new Railway database
 * Run this script ONCE to transfer all your data
 */

const { Client } = require('pg');
require('dotenv').config();

// Old Railway Database (source)
const OLD_DATABASE_URL = "postgresql://postgres:MnFZUReMfbaaAqRzMLyLbrdnxDTabUux@altaria.proxy.rlwy.net:15519/railway";

// New Railway Database (target) - from .env
const NEW_DATABASE_URL = process.env.DATABASE_URL;

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║                                                        ║');
console.log('║   🚀 COMPLETE DATA MIGRATION SCRIPT 🚀                ║');
console.log('║                                                        ║');
console.log('║   From: OLD Railway Database                          ║');
console.log('║   To:   NEW Railway Database                          ║');
console.log('║                                                        ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('\n');

// List of tables in correct order (respecting foreign keys)
const TABLES_IN_ORDER = [
  // Core tables first (no dependencies)
  'users',
  'branches',
  'categories',
  'products',
  'vaults',
  'partners',
  'suppliers',
  'customers',
  'fabric_types',
  
  // Tables with one-level dependencies
  'inventory',
  'partner_transactions',
  'customer_payments',
  'vault_transactions',
  'fabric_stock',
  'fabric_purchases',
  
  // Tables with two-level dependencies
  'shifts',
  'sales',
  'sale_items',
  'purchases',
  'purchase_items',
  'product_serials',
  'transfers',
  'transfer_items',
  'expenses',
  'activity_logs',
  'money_transfers',
  
  // Manufacturing and production
  'manufacturing_orders',
  'manufacturing_order_fabrics',
  'washing_orders',
  
  // Office operations
  'wholesale_employees',
  'office_invoices',
  'office_invoice_items',
  'office_returns',
  'office_return_items',
  
  // Returns
  'returns',
  'return_items',
  'customer_store_returns',
  'customer_store_return_items',
  
  // Audits
  'inventory_audits',
  'inventory_audit_items',
  
  // Misc
  'miscellaneous_expenses',
  'supplier_payments',
  'shipments',
  'sync_logs',
];

async function migrateTable(oldClient, newClient, tableName) {
  try {
    console.log(`\n📦 Migrating ${tableName}...`);
    
    // Check if table exists in old database
    const tableExists = await oldClient.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      );
    `, [tableName]);

    if (!tableExists.rows[0].exists) {
      console.log(`   ⚠️  Table ${tableName} doesn't exist in old database, skipping...`);
      return { success: true, skipped: true, count: 0 };
    }

    // Count rows in old database
    const countResult = await oldClient.query(`SELECT COUNT(*) FROM "${tableName}"`);
    const totalRows = parseInt(countResult.rows[0].count);
    
    if (totalRows === 0) {
      console.log(`   ℹ️  Table ${tableName} is empty, skipping...`);
      return { success: true, skipped: true, count: 0 };
    }

    console.log(`   Found ${totalRows} rows to migrate`);

    // Get all data from old database
    const dataResult = await oldClient.query(`SELECT * FROM "${tableName}"`);
    const rows = dataResult.rows;

    if (rows.length === 0) {
      console.log(`   ✅ No data to migrate`);
      return { success: true, count: 0 };
    }

    // Get column names
    const columns = Object.keys(rows[0]);
    
    // Clear existing data in new database for this table (with CASCADE)
    await newClient.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
    console.log(`   🗑️  Cleared existing data in new database`);

    // Insert data in batches
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      for (const row of batch) {
        const values = columns.map(col => row[col]);
        const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
        const columnsList = columns.map(col => `"${col}"`).join(', ');
        
        const insertQuery = `
          INSERT INTO "${tableName}" (${columnsList})
          VALUES (${placeholders})
          ON CONFLICT DO NOTHING
        `;
        
        await newClient.query(insertQuery, values);
        insertedCount++;
      }
      
      const progress = Math.min(((i + batchSize) / rows.length) * 100, 100).toFixed(0);
      process.stdout.write(`\r   📊 Progress: ${progress}% (${insertedCount}/${totalRows})`);
    }
    
    console.log(`\n   ✅ Migrated ${insertedCount} rows successfully!`);
    return { success: true, count: insertedCount };

  } catch (error) {
    console.error(`\n   ❌ Error migrating ${tableName}:`, error.message);
    return { success: false, error: error.message, count: 0 };
  }
}

async function migrateAllData() {
  const oldClient = new Client({
    connectionString: OLD_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const newClient = new Client({
    connectionString: NEW_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Connect to both databases
    console.log('🔌 Connecting to OLD database...');
    await oldClient.connect();
    console.log('✅ Connected to OLD database\n');

    console.log('🔌 Connecting to NEW database...');
    await newClient.connect();
    console.log('✅ Connected to NEW database\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Starting migration process...\n');

    const results = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      details: []
    };

    // Migrate each table
    for (const tableName of TABLES_IN_ORDER) {
      const result = await migrateTable(oldClient, newClient, tableName);
      
      results.total++;
      if (result.success) {
        if (result.skipped) {
          results.skipped++;
        } else {
          results.successful++;
        }
      } else {
        results.failed++;
      }
      
      results.details.push({
        table: tableName,
        ...result
      });

      // Small delay between tables
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Close connections
    await oldClient.end();
    await newClient.end();

    // Print summary
    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 MIGRATION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successful: ${results.successful} tables`);
    console.log(`⚠️  Skipped: ${results.skipped} tables (empty or missing)`);
    console.log(`❌ Failed: ${results.failed} tables`);
    console.log(`📦 Total: ${results.total} tables processed`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Print details
    console.log('📋 DETAILED RESULTS:\n');
    results.details.forEach(detail => {
      const icon = detail.success ? (detail.skipped ? '⚠️ ' : '✅') : '❌';
      const status = detail.success ? (detail.skipped ? 'SKIPPED' : 'SUCCESS') : 'FAILED';
      console.log(`${icon} ${detail.table.padEnd(35)} - ${status} (${detail.count} rows)`);
      if (detail.error) {
        console.log(`     Error: ${detail.error}`);
      }
    });

    console.log('\n');
    
    if (results.failed === 0) {
      console.log('🎉🎉🎉 MIGRATION COMPLETED SUCCESSFULLY! 🎉🎉🎉');
      console.log('✨ All your data has been transferred to the new Railway database!');
      process.exit(0);
    } else {
      console.log('⚠️  Migration completed with some errors.');
      console.log('   Please check the failed tables above and retry if needed.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error);
    
    await oldClient.end();
    await newClient.end();
    
    process.exit(1);
  }
}

// Start migration
migrateAllData();
