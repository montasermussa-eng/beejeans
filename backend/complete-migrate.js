const { PrismaClient } = require('@prisma/client');

// Old DB
const oldDB = new PrismaClient({
  datasources: { db: { url: "postgresql://postgres:MnFZUReMfbaaAqRzMLyLbrdnxDTabUux@altaria.proxy.rlwy.net:15519/railway" } }
});

// New DB  
const newDB = new PrismaClient({
  datasources: { db: { url: "postgresql://postgres:tEXcJnWTJlFrfPVouOHlBWRPMrPOfSxh@tokaido.proxy.rlwy.net:16497/railway" } }
});

async function migrateTable(tableName, modelName) {
  try {
    console.log(`📋 ${tableName}...`);
    const data = await oldDB[modelName].findMany();
    
    if (data.length === 0) {
      console.log(`   ⏭️  فارغ (0 سجل)`);
      return 0;
    }

    let success = 0;
    for (const item of data) {
      try {
        await newDB[modelName].create({ data: item });
        success++;
      } catch (err) {
        // Skip duplicates
      }
    }
    console.log(`   ✅ ${success}/${data.length} سجل`);
    return success;
  } catch (error) {
    console.log(`   ⚠️ خطأ: ${error.message}`);
    return 0;
  }
}

async function migrate() {
  console.log('🚀 بدء النقل الكامل...\n');
  
  let total = 0;

  try {
    // Core tables
    total += await migrateTable('Categories', 'category');
    total += await migrateTable('Users', 'user');
    total += await migrateTable('Branches', 'branch');
    total += await migrateTable('Vaults', 'vault');
    
    // Products & Inventory
    total += await migrateTable('Products', 'product');
    total += await migrateTable('Inventory', 'inventory');
    
    // Partners
    total += await migrateTable('Customers', 'customer');
    total += await migrateTable('Suppliers', 'supplier');
    total += await migrateTable('Partners', 'partner');
    
    // Fabrics
    total += await migrateTable('Fabric Types', 'fabricType');
    total += await migrateTable('Fabric Purchases', 'fabricPurchase');
    
    // Purchases
    total += await migrateTable('Purchases', 'purchase');
    total += await migrateTable('Purchase Items', 'purchaseItem');
    
    // Manufacturing
    total += await migrateTable('Manufacturing Orders', 'manufacturingOrder');
    total += await migrateTable('Manufacturing Order Fabrics', 'manufacturingOrderFabric');
    total += await migrateTable('Washing Orders', 'washingOrder');
    
    // Sales
    total += await migrateTable('Sales', 'sale');
    total += await migrateTable('Sale Items', 'saleItem');
    
    // Returns
    total += await migrateTable('Returns', 'return');
    total += await migrateTable('Return Items', 'returnItem');
    
    // Expenses
    total += await migrateTable('Expenses', 'expense');
    
    // Transfers
    total += await migrateTable('Transfers', 'transfer');
    total += await migrateTable('Transfer Items', 'transferItem');
    
    // Payments
    total += await migrateTable('Customer Payments', 'customerPayment');
    total += await migrateTable('Supplier Payments', 'supplierPayment');
    
    // Office
    total += await migrateTable('Office Customers', 'officeCustomer');
    total += await migrateTable('Office Invoices', 'officeInvoice');
    total += await migrateTable('Office Invoice Items', 'officeInvoiceItem');
    total += await migrateTable('Office Returns', 'officeReturn');
    total += await migrateTable('Office Return Items', 'officeReturnItem');
    
    // Employees
    total += await migrateTable('Wholesale Employees', 'wholesaleEmployee');
    
    // Audits
    total += await migrateTable('Audits', 'audit');
    total += await migrateTable('Audit Items', 'auditItem');
    
    // Activity Logs
    total += await migrateTable('Activity Logs', 'activityLog');

    console.log(`\n🎉 تم النقل بنجاح!`);
    console.log(`📊 إجمالي السجلات: ${total}`);

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await oldDB.$disconnect();
    await newDB.$disconnect();
  }
}

migrate();
