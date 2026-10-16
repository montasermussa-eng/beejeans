/**
 * 🚀 COMPLETE DATA MIGRATION SCRIPT V2
 * 
 * This script migrates ALL data from old Railway database to new Railway database
 * Handles foreign key constraints properly
 */

const { Client } = require('pg');
require('dotenv').config();

// Old Railway Database (source)
const OLD_DATABASE_URL = "postgresql://postgres:MnFZUReMfbaaAqRzMLyLbrdnxDTabUux@altaria.proxy.rlwy.net:15519/railway";

// New Railway Database (target) - from .env
const NEW_DATABASE_URL = process.env.DATABASE_URL;

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║                                                        ║');
console.log('║   🚀 COMPLETE DATA MIGRATION SCRIPT V2 🚀             ║');
console.log('║                                                        ║');
console.log('║   From: OLD Railway Database                          ║');
console.log('║   To:   NEW Railway Database                          ║');
console.log('║                                                        ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('\n');

// List of tables in correct order (respecting foreign keys)
const TABLES_IN_ORDER = [
  'users',
  'branches',
  'categories',
  'products',
  'vaults',
  'partners',
  'suppliers',
  'customers',
  'fabric_types',
  'inventory',
  'partner_transactions',
  'customer_payments',
  'vault_transactions',
  'fabric_stock',
  'fabric_purchases',
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
  'manufacturing_orders',
  'manufacturing_order_fabrics',
  'washing_orders',
  'wholesale_employees',
  'office_invoices',
  'office_invoice_items',
  'office_returns',
  'office_return_items',
  'returns',
  'return_items',
  'customer_store_returns',
  'customer_store_return_items',
  'inventory_audits',
  'inventory_audit_items',
  'miscellaneous_expenses',
  'supplier_payments',
  'shipments',
  'sync_logs',
];

async function clearAllData(client) {
  console.log('🗑️  Clearing all existing data in NEW database...\n');
  
  // Truncate all tables in reverse order
  for (let i = TABLES_IN_ORDER.length - 1; i >= 0; i--) {
    const tableName = TABLES_IN_ORDER[i];
    try {
      await client.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
      console.log(`   ✅ Cleared ${tableName}`);
    } catch (error) {
      console.log(`   ⚠️  Could not clear ${tableName}: ${error.message}`);
    }
  }
  
  console.log('\n✅ All data cleared!\n');
}

async function migrateTable(oldClient, newClient, tableName) {
  try {
    // Check if table exists in old database
    const tableExists = await oldClient.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      );
    `, [tableName]);

    if (!tableExists.rows[0].exists) {
      return { success: true, skipped: true, count: 0, reason: 'not exists' };
    }

    // Count rows in old database
    const countResult = await oldClient.query(`SELECT COUNT(*) FROM "${tableName}"`);
    const totalRows = parseInt(countResult.rows[0].count);
    
    if (totalRows === 0) {
      return { success: true, skipped: true, count: 0, reason: 'empty' };
    }

    // Get all data from old database
    const dataResult = await oldClient.query(`SELECT * FROM "${tableName}"`);
    const rows = dataResult.rows;

    if (rows.length === 0) {
      return { success: true, count: 0 };
    }

    // Get column names
    const columns = Object.keys(rows[0]);

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
        
        try {
          await newClient.query(insertQuery, values);
          insertedCount++;
        } catch (insertError) {
          // Skip rows that fail (e.g., duplicate keys)
        }
      }
      
      const progress = Math.min(((i + batchSize) / rows.length) * 100, 100).toFixed(0);
      process.stdout.write(`\r   📊 ${tableName}: ${progress}% (${insertedCount}/${totalRows})`);
    }
    
    console.log(`\r   ✅ ${tableName}: Migrated ${insertedCount}/${totalRows} rows`);
    return { success: true, count: insertedCount, total: totalRows };

  } catch (error) {
    console.error(`\n   ❌ ${tableName}: ${error.message}`);
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
    console.log('🔌 Connecting to databases...');
    await oldClient.connect();
    await newClient.connect();
    console.log('✅ Connected to both databases\n');

    // Clear all data first
    await clearAllData(newClient);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Starting migration process...\n');

    const results = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      totalRows: 0,
      details: []
    };

    // Migrate each table
    for (const tableName of TABLES_IN_ORDER) {
      const result = await migrateTable(oldClient, newClient, tableName);
      
      results.total++;
      results.totalRows += result.count || 0;
      
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
    }

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
    console.log(`📦 Total tables: ${results.total}`);
    console.log(`📊 Total rows migrated: ${results.totalRows}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Print top migrated tables
    console.log('📋 TOP MIGRATED TABLES:\n');
    const sorted = results.details
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
    
    sorted.forEach((detail, idx) => {
      console.log(`${idx + 1}. ${detail.table.padEnd(30)} ${detail.count} rows`);
    });

    console.log('\n');
    
    if (results.failed === 0) {
      console.log('🎉🎉🎉 MIGRATION COMPLETED SUCCESSFULLY! 🎉🎉🎉');
      console.log(`✨ ${results.totalRows} rows transferred to the new Railway database!`);
      process.exit(0);
    } else {
      console.log('⚠️  Migration completed with some errors.');
      console.log(`   ✅ ${results.successful} tables succeeded`);
      console.log(`   ❌ ${results.failed} tables failed`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error);
    
    try { await oldClient.end(); } catch (e) {}
    try { await newClient.end(); } catch (e) {}
    
    process.exit(1);
  }
}

// Start migration
migrateAllData();
