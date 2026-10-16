const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:tEXcJnWTJlFrfPVouOHlBWRPMrPOfSxh@tokaido.proxy.rlwy.net:16497/railway",
  ssl: { rejectUnauthorized: false }
});

async function addMissingColumns() {
  try {
    await client.connect();
    console.log('🔌 Connected to database\n');

    // Add refundAmount to office_invoices
    console.log('📋 Adding refundAmount to office_invoices...');
    await client.query(`
      ALTER TABLE office_invoices 
      ADD COLUMN IF NOT EXISTS "refundAmount" DECIMAL(10, 2) DEFAULT 0;
    `);
    console.log('✅ Added refundAmount\n');

    // Add returnedQuantity to office_invoice_items
    console.log('📋 Adding returnedQuantity to office_invoice_items...');
    await client.query(`
      ALTER TABLE office_invoice_items 
      ADD COLUMN IF NOT EXISTS "returnedQuantity" INTEGER DEFAULT 0;
    `);
    console.log('✅ Added returnedQuantity\n');

    console.log('🎉 All missing columns added successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

addMissingColumns();
