const { Client } = require('pg');
require('dotenv').config();

async function fixOfficeReturnsSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // List of required columns with their types
    const requiredColumns = [
      { name: 'totalCost', type: 'DOUBLE PRECISION', default: '0' },
      { name: 'refundMethod', type: 'TEXT', default: "'VAULT_CASH'" },
      { name: 'deductedFromPaid', type: 'DOUBLE PRECISION', default: '0' },
      { name: 'deductedFromDebt', type: 'DOUBLE PRECISION', default: '0' },
      { name: 'vaultId', type: 'TEXT', default: 'NULL', nullable: true }
    ];

    console.log('🔍 Checking office_returns table schema...\n');

    // Get existing columns
    const existingColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'office_returns'
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
        
        const nullable = col.nullable ? '' : 'NOT NULL';
        const defaultValue = col.default;
        
        await client.query(`
          ALTER TABLE office_returns 
          ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type} ${nullable} DEFAULT ${defaultValue};
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
      WHERE table_name = 'office_returns'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Final schema:');
    finalSchema.rows.forEach(col => {
      console.log(`  ✓ ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
    });

    await client.end();
    console.log('\n🎉 All done! office_returns table is ready.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

fixOfficeReturnsSchema();
