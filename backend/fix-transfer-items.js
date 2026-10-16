const { Client } = require('pg');
require('dotenv').config();

async function fixTransferItems() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('➕ Adding transferPrice column to transfer_items...');
    
    await client.query(`
      ALTER TABLE transfer_items 
      ADD COLUMN IF NOT EXISTS "transferPrice" DOUBLE PRECISION DEFAULT 0;
    `);
    
    console.log('✅ transferPrice column added!\n');

    // Verify
    const verify = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'transfer_items' AND column_name = 'transferPrice';
    `);

    if (verify.rows.length > 0) {
      console.log('✅ Verification successful:');
      console.log(verify.rows[0]);
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

fixTransferItems();
