const { Client } = require('pg');
require('dotenv').config();

async function fixStoreReturnsSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'customer_store_returns'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ customer_store_returns table does not exist!');
      await client.end();
      process.exit(1);
    }

    console.log('✅ customer_store_returns table exists\n');

    // List of required columns with their types
    const requiredColumns = [
      { name: 'totalCost', type: 'DOUBLE PRECISION', default: '0' },
      { name: 'totalProfit', type: 'DOUBLE PRECISION', default: '0' }
    ];

    console.log('🔍 Checking customer_store_returns table schema...\n');

    // Get existing columns
    const existingColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'customer_store_returns'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Existing columns:');
    existingColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    console.log();

    const existingColumnNames = existingColumns.rows.map(c => c.column_name);

    // Add missing columns
    for (const col of requiredColumns) {
      if (!existingColumnNames.includes(col.name)) {
        console.log(`➕ Adding missing column: ${col.name}...`);
        
        await client.query(`
          ALTER TABLE customer_store_returns 
          ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type} NOT NULL DEFAULT ${col.default};
        `);
        
        console.log(`✅ Added ${col.name}\n`);
      } else {
        console.log(`✅ ${col.name} already exists\n`);
      }
    }

    // Verify final schema
    console.log('🔍 Final verification...\n');
    const finalSchema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'customer_store_returns'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Final schema:');
    finalSchema.rows.forEach(col => {
      console.log(`  ✓ ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
    });

    await client.end();
    console.log('\n🎉 All done! customer_store_returns table is ready.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

fixStoreReturnsSchema();
