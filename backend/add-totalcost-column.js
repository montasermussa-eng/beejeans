const { Client } = require('pg');
require('dotenv').config();

async function addTotalCostColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check if totalCost column exists
    console.log('🔍 Checking if totalCost column exists in office_returns...');
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'office_returns' 
      AND column_name = 'totalCost';
    `);

    if (checkResult.rows.length > 0) {
      console.log('✅ totalCost column already exists!\n');
    } else {
      console.log('➕ Adding totalCost column to office_returns...');
      await client.query(`
        ALTER TABLE office_returns 
        ADD COLUMN IF NOT EXISTS "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0;
      `);
      console.log('✅ totalCost column added successfully!\n');
    }

    // Verify
    const verifyResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'office_returns' 
      AND column_name = 'totalCost';
    `);

    if (verifyResult.rows.length > 0) {
      console.log('✅ Verification successful:');
      console.log(verifyResult.rows[0]);
    }

    await client.end();
    console.log('\n🎉 Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

addTotalCostColumn();
