const { Client } = require('pg');

const oldDB = new Client({
  connectionString: "postgresql://postgres:MnFZUReMfbaaAqRzMLyLbrdnxDTabUux@altaria.proxy.rlwy.net:15519/railway",
  ssl: { rejectUnauthorized: false }
});

const newDB = new Client({
  connectionString: "postgresql://postgres:tEXcJnWTJlFrfPVouOHlBWRPMrPOfSxh@tokaido.proxy.rlwy.net:16497/railway",
  ssl: { rejectUnauthorized: false }
});

async function copyTable(tableName) {
  try {
    console.log(`\n📋 ${tableName}...`);
    
    // Get data from old DB
    const result = await oldDB.query(`SELECT * FROM "${tableName}"`);
    
    if (result.rows.length === 0) {
      console.log(`   ⏭️  فارغ (0 سجل)`);
      return 0;
    }

    console.log(`   📊 ${result.rows.length} سجل موجود في القديمة`);

    // Get columns
    const columns = Object.keys(result.rows[0]);
    const columnsList = columns.map(c => `"${c}"`).join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    let inserted = 0;
    let skipped = 0;

    // Insert into new DB
    for (const row of result.rows) {
      const values = columns.map(col => row[col]);
      
      try {
        await newDB.query(
          `INSERT INTO "${tableName}" (${columnsList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
        inserted++;
      } catch (err) {
        skipped++;
      }
    }

    console.log(`   ✅ تم نسخ ${inserted} سجل${skipped > 0 ? ` (تم تخطي ${skipped} موجود مسبقاً)` : ''}`);
    return inserted;

  } catch (error) {
    console.log(`   ❌ خطأ: ${error.message}`);
    return 0;
  }
}

async function migrate() {
  try {
    await oldDB.connect();
    await newDB.connect();

    console.log('🚀 نقل الجداول المتبقية...\n');

    let total = 0;

    // Get all tables from old database
    const tablesResult = await oldDB.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name;
    `);

    console.log(`📊 عدد الجداول: ${tablesResult.rows.length}\n`);

    // Copy each table
    for (const { table_name } of tablesResult.rows) {
      const count = await copyTable(table_name);
      total += count;
    }

    console.log(`\n🎉 اكتمل النقل!`);
    console.log(`📊 إجمالي السجلات الجديدة: ${total}`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await oldDB.end();
    await newDB.end();
  }
}

migrate().catch(console.error);
