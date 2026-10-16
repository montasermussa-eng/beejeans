const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:tEXcJnWTJlFrfPVouOHlBWRPMrPOfSxh@tokaido.proxy.rlwy.net:16497/railway",
  ssl: { rejectUnauthorized: false }
});

async function createMissingTables() {
  try {
    await client.connect();
    console.log('🔌 Connected to database\n');

    // Create office_returns table
    console.log('📋 Creating office_returns table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS office_returns (
        id TEXT PRIMARY KEY,
        "returnNumber" TEXT NOT NULL UNIQUE,
        "invoiceId" TEXT,
        "customerId" TEXT,
        "customerName" TEXT,
        "customerPhone" TEXT,
        type TEXT NOT NULL DEFAULT 'REGULAR',
        "returnType" TEXT NOT NULL DEFAULT 'REFUND',
        "totalAmount" DECIMAL(10, 2) NOT NULL DEFAULT 0,
        "refundAmount" DECIMAL(10, 2) NOT NULL DEFAULT 0,
        "vaultId" TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING',
        notes TEXT,
        "createdById" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ office_returns created\n');

    // Create indexes for office_returns
    console.log('📋 Creating indexes for office_returns...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS office_returns_return_number_idx ON office_returns("returnNumber");
      CREATE INDEX IF NOT EXISTS office_returns_invoice_id_idx ON office_returns("invoiceId");
      CREATE INDEX IF NOT EXISTS office_returns_customer_id_idx ON office_returns("customerId");
      CREATE INDEX IF NOT EXISTS office_returns_vault_id_idx ON office_returns("vaultId");
      CREATE INDEX IF NOT EXISTS office_returns_created_at_idx ON office_returns("createdAt");
    `);
    console.log('✅ Indexes created\n');

    // Create office_return_items table
    console.log('📋 Creating office_return_items table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS office_return_items (
        id TEXT PRIMARY KEY,
        "returnId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "invoiceItemId" TEXT,
        quantity INTEGER NOT NULL,
        "unitPrice" DECIMAL(10, 2) NOT NULL,
        "totalPrice" DECIMAL(10, 2) NOT NULL,
        reason TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ office_return_items created\n');

    // Create indexes for office_return_items
    console.log('📋 Creating indexes for office_return_items...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS office_return_items_return_id_idx ON office_return_items("returnId");
      CREATE INDEX IF NOT EXISTS office_return_items_product_id_idx ON office_return_items("productId");
    `);
    console.log('✅ Indexes created\n');

    // Add foreign key constraints
    console.log('📋 Adding foreign key constraints...');
    await client.query(`
      ALTER TABLE office_returns 
      ADD CONSTRAINT IF NOT EXISTS fk_office_returns_invoice 
      FOREIGN KEY ("invoiceId") REFERENCES office_invoices(id) ON DELETE SET NULL;
      
      ALTER TABLE office_returns 
      ADD CONSTRAINT IF NOT EXISTS fk_office_returns_customer 
      FOREIGN KEY ("customerId") REFERENCES customers(id) ON DELETE SET NULL;
      
      ALTER TABLE office_returns 
      ADD CONSTRAINT IF NOT EXISTS fk_office_returns_vault 
      FOREIGN KEY ("vaultId") REFERENCES vaults(id) ON DELETE SET NULL;
      
      ALTER TABLE office_returns 
      ADD CONSTRAINT IF NOT EXISTS fk_office_returns_created_by 
      FOREIGN KEY ("createdById") REFERENCES users(id) ON DELETE RESTRICT;
      
      ALTER TABLE office_return_items 
      ADD CONSTRAINT IF NOT EXISTS fk_office_return_items_return 
      FOREIGN KEY ("returnId") REFERENCES office_returns(id) ON DELETE CASCADE;
      
      ALTER TABLE office_return_items 
      ADD CONSTRAINT IF NOT EXISTS fk_office_return_items_product 
      FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE RESTRICT;
    `);
    console.log('✅ Foreign keys added\n');

    console.log('🎉 All missing tables created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createMissingTables();
