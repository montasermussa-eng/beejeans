const { Client } = require('pg');
require('dotenv').config();

async function fixAllMissingColumns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Fix 1: Add returnReason to office_returns
    console.log('1️⃣ Adding returnReason to office_returns...');
    await client.query(`
      ALTER TABLE office_returns 
      ADD COLUMN IF NOT EXISTS "returnReason" TEXT;
    `);
    console.log('✅ returnReason added\n');

    // Fix 2: Add totalFabricCost to manufacturing_orders
    console.log('2️⃣ Adding totalFabricCost to manufacturing_orders...');
    await client.query(`
      ALTER TABLE manufacturing_orders 
      ADD COLUMN IF NOT EXISTS "totalFabricCost" DOUBLE PRECISION DEFAULT 0;
    `);
    console.log('✅ totalFabricCost added\n');

    // Fix 3: Add grandTotalCost to manufacturing_orders (if needed)
    console.log('3️⃣ Adding grandTotalCost to manufacturing_orders...');
    await client.query(`
      ALTER TABLE manufacturing_orders 
      ADD COLUMN IF NOT EXISTS "grandTotalCost" DOUBLE PRECISION DEFAULT 0;
    `);
    console.log('✅ grandTotalCost added\n');

    // Verify office_returns
    console.log('🔍 Verifying office_returns...');
    const officeReturnsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'office_returns' AND column_name = 'returnReason';
    `);
    console.log(officeReturnsCheck.rows.length > 0 ? '✅ returnReason exists' : '❌ returnReason missing');

    // Verify manufacturing_orders
    console.log('🔍 Verifying manufacturing_orders...');
    const mfgCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'manufacturing_orders' 
      AND column_name IN ('totalFabricCost', 'grandTotalCost');
    `);
    console.log(`✅ Found ${mfgCheck.rows.length} columns in manufacturing_orders`);
    mfgCheck.rows.forEach(row => console.log(`   - ${row.column_name}`));

    await client.end();
    console.log('\n🎉 All fixes applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

fixAllMissingColumns();
