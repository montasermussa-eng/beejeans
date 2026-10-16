/**
 * ⚠️  IMPORTANT: Run this script ONCE on Railway to fix all missing columns
 * 
 * This script adds ALL missing columns to the Railway database:
 * 1. office_returns: totalCost, refundMethod, deductedFromPaid, deductedFromDebt, returnReason
 * 2. manufacturing_orders: totalFabricCost, grandTotalCost
 * 3. transfer_items: transferPrice
 * 4. manufacturing_order_fabrics table (if missing)
 */

const { Client } = require('pg');
require('dotenv').config();

async function applyAllFixes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Railway database\n');
    console.log('🔧 Starting to apply all fixes...\n');

    // ========================================
    // FIX 1: office_returns columns
    // ========================================
    console.log('1️⃣ Fixing office_returns table...');
    
    await client.query(`
      ALTER TABLE office_returns 
      ADD COLUMN IF NOT EXISTS "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "refundMethod" TEXT NOT NULL DEFAULT 'VAULT_CASH',
      ADD COLUMN IF NOT EXISTS "deductedFromPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "deductedFromDebt" DOUBLE PRECISION NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "returnReason" TEXT;
    `);
    console.log('   ✅ office_returns fixed\n');

    // ========================================
    // FIX 2: manufacturing_orders columns
    // ========================================
    console.log('2️⃣ Fixing manufacturing_orders table...');
    
    await client.query(`
      ALTER TABLE manufacturing_orders 
      ADD COLUMN IF NOT EXISTS "totalFabricCost" DOUBLE PRECISION DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "grandTotalCost" DOUBLE PRECISION DEFAULT 0;
    `);
    console.log('   ✅ manufacturing_orders fixed\n');

    // ========================================
    // FIX 3: transfer_items column
    // ========================================
    console.log('3️⃣ Fixing transfer_items table...');
    
    await client.query(`
      ALTER TABLE transfer_items 
      ADD COLUMN IF NOT EXISTS "transferPrice" DOUBLE PRECISION DEFAULT 0;
    `);
    console.log('   ✅ transfer_items fixed\n');

    // ========================================
    // FIX 4: manufacturing_order_fabrics table
    // ========================================
    console.log('4️⃣ Checking manufacturing_order_fabrics table...');
    
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'manufacturing_order_fabrics'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('   ➕ Creating manufacturing_order_fabrics table...');
      
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

        CREATE INDEX "manufacturing_order_fabrics_fabricTypeId_idx" 
        ON manufacturing_order_fabrics("fabricTypeId");
        
        CREATE INDEX "manufacturing_order_fabrics_manufacturingOrderId_idx" 
        ON manufacturing_order_fabrics("manufacturingOrderId");
      `);
      
      console.log('   ✅ manufacturing_order_fabrics table created\n');
    } else {
      console.log('   ✅ manufacturing_order_fabrics table already exists\n');
    }

    // ========================================
    // VERIFICATION
    // ========================================
    console.log('🔍 Verifying all fixes...\n');

    const verifications = [
      { table: 'office_returns', column: 'totalCost' },
      { table: 'office_returns', column: 'refundMethod' },
      { table: 'office_returns', column: 'returnReason' },
      { table: 'manufacturing_orders', column: 'totalFabricCost' },
      { table: 'manufacturing_orders', column: 'grandTotalCost' },
      { table: 'transfer_items', column: 'transferPrice' },
    ];

    let allGood = true;
    for (const { table, column } of verifications) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = $2
        );
      `, [table, column]);

      if (result.rows[0].exists) {
        console.log(`✅ ${table}.${column}`);
      } else {
        console.log(`❌ ${table}.${column} - STILL MISSING!`);
        allGood = false;
      }
    }

    // Check table
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'manufacturing_order_fabrics'
      );
    `);
    if (tableCheck.rows[0].exists) {
      console.log(`✅ manufacturing_order_fabrics table`);
    } else {
      console.log(`❌ manufacturing_order_fabrics table - STILL MISSING!`);
      allGood = false;
    }

    await client.end();

    if (allGood) {
      console.log('\n🎉🎉🎉 ALL FIXES APPLIED SUCCESSFULLY! 🎉🎉🎉');
      console.log('\n✨ Your Railway database is now fully synchronized!');
      console.log('✨ All API endpoints should work now!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some fixes failed. Please check the errors above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error('\nFull error:');
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║                                                        ║');
console.log('║   🚀 RAILWAY DATABASE FIX SCRIPT 🚀                   ║');
console.log('║                                                        ║');
console.log('║   This will add all missing columns and tables        ║');
console.log('║   to your Railway production database.                ║');
console.log('║                                                        ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('\n');

applyAllFixes();
