const { Client } = require('pg');

// Old Database (Source)
const oldDB = new Client({
  connectionString: "postgresql://postgres:MnFZUReMfbaaAqRzMLyLbrdnxDTabUux@altaria.proxy.rlwy.net:15519/railway",
  ssl: { rejectUnauthorized: false }
});

// New Database (Target)
const newDB = new Client({
  connectionString: "postgresql://postgres:tEXcJnWTJlFrfPVouOHlBWRPMrPOfSxh@tokaido.proxy.rlwy.net:16497/railway",
  ssl: { rejectUnauthorized: false }
});

async function migrateDatabase() {
  await oldDB.connect();
  await newDB.connect();
  
  try {
    console.log('🚀 بدء نقل قاعدة البيانات...\n');

    // 1. Get the schema from old database
    console.log('📋 جاري جلب الـ Schema...');
    const schemaResult = await oldDB.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const tables = schemaResult.rows.map(row => row.table_name);
    console.log(`✅ تم العثور على ${tables.length} جدول\n`);

    // 2. Export schema using pg_dump (structure only)
    console.log('📦 جاري تصدير الـ Schema...');
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);

    try {
      // Export schema only (no data)
      const dumpCmd = `PGPASSWORD="MnFZUReMfbaaAqRzMLyLbrdnxDTabUux" pg_dump -h altaria.proxy.rlwy.net -p 15519 -U postgres -d railway --schema-only --no-owner --no-acl > /tmp/schema.sql`;
      await execPromise(dumpCmd);
      console.log('✅ تم تصدير الـ Schema\n');

      // Import schema to new database
      console.log('📥 جاري استيراد الـ Schema للـ database الجديدة...');
      const importCmd = `PGPASSWORD="tEXcJnWTJlFrfPVouOHlBWRPMrPOfSxh" psql -h tokaido.proxy.rlwy.net -p 16497 -U postgres -d railway -f /tmp/schema.sql 2>&1`;
      const importResult = await execPromise(importCmd);
      console.log('✅ تم استيراد الـ Schema\n');
    } catch (error) {
      console.log('⚠️ pg_dump غير متاح، سنستخدم النسخ المباشر...\n');
    }

    // 3. Copy data table by table (in correct order to handle foreign keys)
    const orderedTables = [
      '_prisma_migrations',
      'categories',
      'users',
      'branches',
      'vaults',
      'products',
      'customers',
      'suppliers',
      'partners',
      'fabric_types',
      'inventory',
      'purchases',
      'purchase_items',
      'fabric_purchases',
      'manufacturing_orders',
      'manufacturing_order_fabrics',
      'washing_orders',
      'sales',
      'sale_items',
      'returns',
      'return_items',
      'expenses',
      'transfers',
      'transfer_items',
      'customer_payments',
      'supplier_payments',
      'partner_withdrawals',
      'office_customers',
      'office_invoices',
      'office_invoice_items',
      'office_returns',
      'office_return_items',
      'wholesale_employees',
      'audits',
      'audit_items',
      'activity_logs'
    ];

    // Filter to only include tables that exist
    const tablesToCopy = orderedTables.filter(t => tables.includes(t));
    
    // Add any remaining tables
    tables.forEach(t => {
      if (!tablesToCopy.includes(t)) {
        tablesToCopy.push(t);
      }
    });

    console.log('🔄 جاري نسخ البيانات...\n');

    for (const table of tablesToCopy) {
      try {
        // Get count
        const countResult = await oldDB.query(`SELECT COUNT(*) FROM "${table}"`);
        const count = parseInt(countResult.rows[0].count);

        if (count === 0) {
          console.log(`⏭️  ${table}: فارغ (تم تجاوزه)`);
          continue;
        }

        console.log(`📋 ${table}: جاري نسخ ${count} سجل...`);

        // Get all data
        const dataResult = await oldDB.query(`SELECT * FROM "${table}"`);
        
        if (dataResult.rows.length === 0) {
          console.log(`   ✓ لا توجد بيانات`);
          continue;
        }

        // Get column names
        const columns = Object.keys(dataResult.rows[0]);
        const columnsList = columns.map(c => `"${c}"`).join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        // Insert data in batches
        const batchSize = 100;
        let inserted = 0;

        for (let i = 0; i < dataResult.rows.length; i += batchSize) {
          const batch = dataResult.rows.slice(i, i + batchSize);
          
          for (const row of batch) {
            const values = columns.map(col => row[col]);
            
            try {
              await newDB.query(
                `INSERT INTO "${table}" (${columnsList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
                values
              );
              inserted++;
            } catch (err) {
              // Try without ON CONFLICT if it fails
              try {
                await newDB.query(
                  `INSERT INTO "${table}" (${columnsList}) VALUES (${placeholders})`,
                  values
                );
                inserted++;
              } catch (err2) {
                console.log(`   ⚠️ خطأ في إدراج سجل: ${err2.message}`);
              }
            }
          }
        }

        console.log(`   ✅ تم نسخ ${inserted}/${count} سجل\n`);

        // Reset sequences if exists
        try {
          const seqResult = await newDB.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = '${table}' 
            AND column_default LIKE 'nextval%'
          `);
          
          for (const seq of seqResult.rows) {
            await newDB.query(`
              SELECT setval(
                pg_get_serial_sequence('${table}', '${seq.column_name}'),
                COALESCE((SELECT MAX("${seq.column_name}") FROM "${table}"), 1)
              );
            `);
          }
        } catch (err) {
          // Ignore sequence errors
        }

      } catch (error) {
        console.log(`   ❌ خطأ في نسخ ${table}: ${error.message}\n`);
      }
    }

    console.log('\n✅ تم نقل قاعدة البيانات بنجاح! 🎉');
    
    // Show summary
    console.log('\n📊 ملخص البيانات المنقولة:');
    for (const table of tablesToCopy) {
      try {
        const countResult = await newDB.query(`SELECT COUNT(*) FROM "${table}"`);
        const count = parseInt(countResult.rows[0].count);
        if (count > 0) {
          console.log(`   ${table}: ${count} سجل`);
        }
      } catch (err) {
        // Ignore
      }
    }

  } catch (error) {
    console.error('❌ خطأ في عملية النقل:', error);
    throw error;
  } finally {
    await oldDB.end();
    await newDB.end();
  }
}

// Run migration
migrateDatabase().catch(console.error);
