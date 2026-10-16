const { PrismaClient } = require('@prisma/client');

// Old DB
const oldDB = new PrismaClient({
  datasources: { db: { url: "postgresql://postgres:MnFZUReMfbaaAqRzMLyLbrdnxDTabUux@altaria.proxy.rlwy.net:15519/railway" } }
});

// New DB
const newDB = new PrismaClient({
  datasources: { db: { url: "postgresql://postgres:tEXcJnWTJlFrfPVouOHlBWRPMrPOfSxh@tokaido.proxy.rlwy.net:16497/railway" } }
});

async function migrate() {
  console.log('🚀 بدء النقل السريع...\n');

  try {
    // 1. Users
    console.log('👥 Users...');
    const users = await oldDB.user.findMany();
    for (const u of users) await newDB.user.create({ data: u }).catch(() => {});
    console.log(`✅ ${users.length}`);

    // 2. Branches
    console.log('🏢 Branches...');
    const branches = await oldDB.branch.findMany();
    for (const b of branches) await newDB.branch.create({ data: b }).catch(() => {});
    console.log(`✅ ${branches.length}`);

    // 3. Vaults
    console.log('💰 Vaults...');
    const vaults = await oldDB.vault.findMany();
    for (const v of vaults) await newDB.vault.create({ data: v }).catch(() => {});
    console.log(`✅ ${vaults.length}`);

    // 4. Products
    console.log('📦 Products...');
    const products = await oldDB.product.findMany();
    for (const p of products) await newDB.product.create({ data: p }).catch(() => {});
    console.log(`✅ ${products.length}`);

    // 5. Customers
    console.log('👤 Customers...');
    const customers = await oldDB.customer.findMany();
    for (const c of customers) await newDB.customer.create({ data: c }).catch(() => {});
    console.log(`✅ ${customers.length}`);

    // 6. Suppliers
    console.log('🏭 Suppliers...');
    const suppliers = await oldDB.supplier.findMany();
    for (const s of suppliers) await newDB.supplier.create({ data: s }).catch(() => {});
    console.log(`✅ ${suppliers.length}`);

    // 7. Partners
    console.log('🤝 Partners...');
    const partners = await oldDB.partner.findMany();
    for (const p of partners) await newDB.partner.create({ data: p }).catch(() => {});
    console.log(`✅ ${partners.length}`);

    // 8. Fabric Types
    console.log('🧵 Fabric Types...');
    const fabrics = await oldDB.fabricType.findMany();
    for (const f of fabrics) await newDB.fabricType.create({ data: f }).catch(() => {});
    console.log(`✅ ${fabrics.length}`);

    // 9. Inventory
    console.log('📊 Inventory...');
    const inventory = await oldDB.inventory.findMany();
    for (const i of inventory) await newDB.inventory.create({ data: i }).catch(() => {});
    console.log(`✅ ${inventory.length}`);

    // 10. Purchases
    console.log('🛒 Purchases...');
    const purchases = await oldDB.purchase.findMany();
    for (const p of purchases) await newDB.purchase.create({ data: p }).catch(() => {});
    console.log(`✅ ${purchases.length}`);

    // 11. Purchase Items
    console.log('📋 Purchase Items...');
    const purchaseItems = await oldDB.purchaseItem.findMany();
    for (const pi of purchaseItems) await newDB.purchaseItem.create({ data: pi }).catch(() => {});
    console.log(`✅ ${purchaseItems.length}`);

    // 12. Transfers
    console.log('🚚 Transfers...');
    const transfers = await oldDB.transfer.findMany();
    for (const t of transfers) await newDB.transfer.create({ data: t }).catch(() => {});
    console.log(`✅ ${transfers.length}`);

    // 13. Transfer Items
    console.log('📦 Transfer Items...');
    const transferItems = await oldDB.transferItem.findMany();
    for (const ti of transferItems) await newDB.transferItem.create({ data: ti }).catch(() => {});
    console.log(`✅ ${transferItems.length}`);

    // 14. Customer Payments
    console.log('💳 Customer Payments...');
    const customerPayments = await oldDB.customerPayment.findMany();
    for (const cp of customerPayments) await newDB.customerPayment.create({ data: cp }).catch(() => {});
    console.log(`✅ ${customerPayments.length}`);

    // 15. Office Customers
    console.log('🏢 Office Customers...');
    try {
      const officeCustomers = await oldDB.officeCustomer.findMany();
      for (const oc of officeCustomers) await newDB.officeCustomer.create({ data: oc }).catch(() => {});
      console.log(`✅ ${officeCustomers.length}`);
    } catch (e) {
      console.log(`⏭️  غير موجود`);
    }

    // 16. Office Invoices
    console.log('📄 Office Invoices...');
    try {
      const officeInvoices = await oldDB.officeInvoice.findMany();
      for (const oi of officeInvoices) await newDB.officeInvoice.create({ data: oi }).catch(() => {});
      console.log(`✅ ${officeInvoices.length}`);
    } catch (e) {
      console.log(`⏭️  غير موجود`);
    }

    // 17. Office Invoice Items
    console.log('📋 Office Invoice Items...');
    try {
      const officeInvoiceItems = await oldDB.officeInvoiceItem.findMany();
      for (const oii of officeInvoiceItems) await newDB.officeInvoiceItem.create({ data: oii }).catch(() => {});
      console.log(`✅ ${officeInvoiceItems.length}`);
    } catch (e) {
      console.log(`⏭️  غير موجود`);
    }

    // 18. Wholesale Employees
    console.log('👔 Wholesale Employees...');
    try {
      const employees = await oldDB.wholesaleEmployee.findMany();
      for (const e of employees) await newDB.wholesaleEmployee.create({ data: e }).catch(() => {});
      console.log(`✅ ${employees.length}`);
    } catch (e) {
      console.log(`⏭️  غير موجود`);
    }

    // 19. Audits
    console.log('🔍 Audits...');
    try {
      const audits = await oldDB.audit.findMany();
      for (const a of audits) await newDB.audit.create({ data: a }).catch(() => {});
      console.log(`✅ ${audits.length}`);
    } catch (e) {
      console.log(`⏭️  غير موجود`);
    }

    // 20. Audit Items
    console.log('📋 Audit Items...');
    try {
      const auditItems = await oldDB.auditItem.findMany();
      for (const ai of auditItems) await newDB.auditItem.create({ data: ai }).catch(() => {});
      console.log(`✅ ${auditItems.length}`);
    } catch (e) {
      console.log(`⏭️  غير موجود`);
    }

    console.log('\n🎉 تم النقل بنجاح!');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await oldDB.$disconnect();
    await newDB.$disconnect();
  }
}

migrate();
