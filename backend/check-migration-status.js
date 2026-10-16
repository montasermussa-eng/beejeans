const { Client } = require('pg');
require('dotenv').config();

async function checkMigrationStatus() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to NEW database\n');

    const tables = [
      'users', 'branches', 'products', 'vaults', 'partners', 
      'suppliers', 'customers', 'fabric_types', 'inventory',
      'customer_payments', 'vault_transactions', 'fabric_stock',
      'purchases', 'purchase_items', 'product_serials',
      'transfers', 'transfer_items', 'activity_logs',
      'wholesale_employees', 'office_invoices', 'office_invoice_items',
      'shipments'
    ];

    console.log('📊 MIGRATION STATUS:\n');

    let totalRows = 0;
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM "${table}"`);
      const count = parseInt(result.rows[0].count);
      totalRows += count;
      
      if (count > 0) {
        console.log(`✅ ${table.padEnd(30)} ${count} rows`);
      } else {
        console.log(`⚪ ${table.padEnd(30)} ${count} rows`);
      }
    }

    console.log(`\n📦 Total rows: ${totalRows}`);

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

checkMigrationStatus();
