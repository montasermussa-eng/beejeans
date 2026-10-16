const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:tEXcJnWTJlFrfPVouOHlBWRPMrPOfSxh@tokaido.proxy.rlwy.net:16497/railway",
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    await client.connect();
    console.log('🔌 Connected to database\n');

    // Check all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`📊 Total tables: ${result.rows.length}\n`);
    
    const tables = result.rows.map(r => r.table_name);
    
    // Check specific tables
    const requiredTables = ['office_returns', 'office_return_items', 'office_invoices', 'office_invoice_items'];
    
    console.log('✅ Checking required tables:');
    for (const table of requiredTables) {
      const exists = tables.includes(table);
      console.log(`   ${exists ? '✅' : '❌'} ${table}`);
    }
    
    // Check office_invoices columns
    console.log('\n📋 office_invoices columns:');
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'office_invoices'
      ORDER BY ordinal_position;
    `);
    
    const hasRefundAmount = columns.rows.some(c => c.column_name === 'refundAmount');
    console.log(`   ${hasRefundAmount ? '✅' : '❌'} refundAmount column`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();
