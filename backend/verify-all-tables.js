const { Client } = require('pg');
require('dotenv').config();

async function verifyAllTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // List of critical tables to check
    const criticalTables = [
      'users',
      'branches', 
      'products',
      'inventory',
      'transfers',
      'transfer_items',
      'sales',
      'sale_items',
      'office_invoices',
      'office_invoice_items',
      'office_returns',
      'office_return_items',
      'customer_store_returns',
      'customer_store_return_items',
      'manufacturing_orders',
      'manufacturing_order_fabrics',
      'partners',
      'partner_transactions',
      'vaults',
      'vault_transactions'
    ];

    console.log('🔍 Checking critical tables...\n');

    for (const tableName of criticalTables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        );
      `, [tableName]);

      if (result.rows[0].exists) {
        // Get column count
        const colResult = await client.query(`
          SELECT COUNT(*) as col_count
          FROM information_schema.columns 
          WHERE table_name = $1;
        `, [tableName]);

        console.log(`✅ ${tableName} (${colResult.rows[0].col_count} columns)`);
      } else {
        console.log(`❌ ${tableName} - MISSING!`);
      }
    }

    // Check specific columns
    console.log('\n🔍 Checking specific critical columns...\n');

    const criticalColumns = [
      { table: 'transfer_items', column: 'transferPrice' },
      { table: 'office_returns', column: 'totalCost' },
      { table: 'office_returns', column: 'refundMethod' },
      { table: 'office_returns', column: 'deductedFromPaid' },
      { table: 'office_returns', column: 'deductedFromDebt' },
      { table: 'office_returns', column: 'returnReason' },
      { table: 'customer_store_returns', column: 'totalCost' },
      { table: 'customer_store_returns', column: 'totalProfit' },
      { table: 'manufacturing_orders', column: 'totalFabricCost' },
      { table: 'manufacturing_orders', column: 'grandTotalCost' },
    ];

    for (const { table, column } of criticalColumns) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = $2
        );
      `, [table, column]);

      if (result.rows[0].exists) {
        console.log(`✅ ${table}.${column}`);
      } else {
        console.log(`❌ ${table}.${column} - MISSING!`);
      }
    }

    await client.end();
    console.log('\n🎉 Verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

verifyAllTables();
