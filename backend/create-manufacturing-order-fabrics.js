const { Client } = require('pg');
require('dotenv').config();

async function createManufacturingOrderFabrics() {
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
        WHERE table_name = 'manufacturing_order_fabrics'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('✅ manufacturing_order_fabrics table already exists!\n');
    } else {
      console.log('➕ Creating manufacturing_order_fabrics table...\n');

      await client.query(`
        CREATE TABLE manufacturing_order_fabrics (
          id TEXT PRIMARY KEY,
          "manufacturingOrderId" TEXT NOT NULL,
          "fabricTypeId" TEXT NOT NULL,
          "metersUsed" DOUBLE PRECISION NOT NULL,
          "fabricCostPerMeter" DOUBLE PRECISION NOT NULL,
          "totalFabricCost" DOUBLE PRECISION NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY ("manufacturingOrderId") REFERENCES manufacturing_orders(id) ON DELETE CASCADE,
          FOREIGN KEY ("fabricTypeId") REFERENCES fabric_types(id)
        );

        CREATE INDEX IF NOT EXISTS "manufacturing_order_fabrics_fabricTypeId_idx" 
        ON manufacturing_order_fabrics("fabricTypeId");
        
        CREATE INDEX IF NOT EXISTS "manufacturing_order_fabrics_manufacturingOrderId_idx" 
        ON manufacturing_order_fabrics("manufacturingOrderId");
      `);

      console.log('✅ manufacturing_order_fabrics table created!\n');
    }

    // Verify
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'manufacturing_order_fabrics'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Table structure:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    await client.end();
    console.log('\n🎉 Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

createManufacturingOrderFabrics();
