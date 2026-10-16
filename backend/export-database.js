require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Old database
const oldPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:MnFZUReMfbaaAqRzMLyLbrdnxDTabUux@altaria.proxy.rlwy.net:15519/railway"
    }
  }
});

async function exportDatabase() {
  try {
    console.log('🚀 جاري تصدير قاعدة البيانات...\n');

    const data = {};

    // Export all tables in order
    console.log('📋 Categories...');
    data.categories = await oldPrisma.category.findMany();
    console.log(`   ✅ ${data.categories.length} سجل`);

    console.log('📋 Users...');
    data.users = await oldPrisma.user.findMany();
    console.log(`   ✅ ${data.users.length} سجل`);

    console.log('📋 Branches...');
    data.branches = await oldPrisma.branch.findMany();
    console.log(`   ✅ ${data.branches.length} سجل`);

    console.log('📋 Vaults...');
    data.vaults = await oldPrisma.vault.findMany();
    console.log(`   ✅ ${data.vaults.length} سجل`);

    console.log('📋 Products...');
    data.products = await oldPrisma.product.findMany();
    console.log(`   ✅ ${data.products.length} سجل`);

    console.log('📋 Customers...');
    data.customers = await oldPrisma.customer.findMany();
    console.log(`   ✅ ${data.customers.length} سجل`);

    console.log('📋 Suppliers...');
    data.suppliers = await oldPrisma.supplier.findMany();
    console.log(`   ✅ ${data.suppliers.length} سجل`);

    console.log('📋 Partners...');
    data.partners = await oldPrisma.partner.findMany();
    console.log(`   ✅ ${data.partners.length} سجل`);

    console.log('📋 Fabric Types...');
    data.fabricTypes = await oldPrisma.fabricType.findMany();
    console.log(`   ✅ ${data.fabricTypes.length} سجل`);

    console.log('📋 Inventory...');
    data.inventory = await oldPrisma.inventory.findMany();
    console.log(`   ✅ ${data.inventory.length} سجل`);

    console.log('📋 Purchases...');
    data.purchases = await oldPrisma.purchase.findMany();
    console.log(`   ✅ ${data.purchases.length} سجل`);

    console.log('📋 Purchase Items...');
    data.purchaseItems = await oldPrisma.purchaseItem.findMany();
    console.log(`   ✅ ${data.purchaseItems.length} سجل`);

    console.log('📋 Fabric Purchases...');
    data.fabricPurchases = await oldPrisma.fabricPurchase.findMany();
    console.log(`   ✅ ${data.fabricPurchases.length} سجل`);

    console.log('📋 Manufacturing Orders...');
    data.manufacturingOrders = await oldPrisma.manufacturingOrder.findMany();
    console.log(`   ✅ ${data.manufacturingOrders.length} سجل`);

    console.log('📋 Manufacturing Order Fabrics...');
    data.manufacturingOrderFabrics = await oldPrisma.manufacturingOrderFabric.findMany();
    console.log(`   ✅ ${data.manufacturingOrderFabrics.length} سجل`);

    console.log('📋 Washing Orders...');
    data.washingOrders = await oldPrisma.washingOrder.findMany();
    console.log(`   ✅ ${data.washingOrders.length} سجل`);

    console.log('📋 Sales...');
    data.sales = await oldPrisma.sale.findMany();
    console.log(`   ✅ ${data.sales.length} سجل`);

    console.log('📋 Sale Items...');
    data.saleItems = await oldPrisma.saleItem.findMany();
    console.log(`   ✅ ${data.saleItems.length} سجل`);

    console.log('📋 Returns...');
    data.returns = await oldPrisma.return.findMany();
    console.log(`   ✅ ${data.returns.length} سجل`);

    console.log('📋 Return Items...');
    data.returnItems = await oldPrisma.returnItem.findMany();
    console.log(`   ✅ ${data.returnItems.length} سجل`);

    console.log('📋 Expenses...');
    data.expenses = await oldPrisma.expense.findMany();
    console.log(`   ✅ ${data.expenses.length} سجل`);

    console.log('📋 Transfers...');
    data.transfers = await oldPrisma.transfer.findMany();
    console.log(`   ✅ ${data.transfers.length} سجل`);

    console.log('📋 Transfer Items...');
    data.transferItems = await oldPrisma.transferItem.findMany();
    console.log(`   ✅ ${data.transferItems.length} سجل`);

    console.log('📋 Customer Payments...');
    data.customerPayments = await oldPrisma.customerPayment.findMany();
    console.log(`   ✅ ${data.customerPayments.length} سجل`);

    console.log('📋 Supplier Payments...');
    data.supplierPayments = await oldPrisma.supplierPayment.findMany();
    console.log(`   ✅ ${data.supplierPayments.length} سجل`);

    console.log('📋 Partner Withdrawals...');
    try {
      data.partnerWithdrawals = await oldPrisma.partnerWithdrawal.findMany();
      console.log(`   ✅ ${data.partnerWithdrawals.length} سجل`);
    } catch (err) {
      data.partnerWithdrawals = [];
      console.log(`   ⏭️  غير موجود`);
    }

    console.log('📋 Office Customers...');
    data.officeCustomers = await oldPrisma.officeCustomer.findMany();
    console.log(`   ✅ ${data.officeCustomers.length} سجل`);

    console.log('📋 Office Invoices...');
    data.officeInvoices = await oldPrisma.officeInvoice.findMany();
    console.log(`   ✅ ${data.officeInvoices.length} سجل`);

    console.log('📋 Office Invoice Items...');
    data.officeInvoiceItems = await oldPrisma.officeInvoiceItem.findMany();
    console.log(`   ✅ ${data.officeInvoiceItems.length} سجل`);

    console.log('📋 Office Returns...');
    data.officeReturns = await oldPrisma.officeReturn.findMany();
    console.log(`   ✅ ${data.officeReturns.length} سجل`);

    console.log('📋 Office Return Items...');
    data.officeReturnItems = await oldPrisma.officeReturnItem.findMany();
    console.log(`   ✅ ${data.officeReturnItems.length} سجل`);

    console.log('📋 Wholesale Employees...');
    data.wholesaleEmployees = await oldPrisma.wholesaleEmployee.findMany();
    console.log(`   ✅ ${data.wholesaleEmployees.length} سجل`);

    console.log('📋 Audits...');
    data.audits = await oldPrisma.audit.findMany();
    console.log(`   ✅ ${data.audits.length} سجل`);

    console.log('📋 Audit Items...');
    data.auditItems = await oldPrisma.auditItem.findMany();
    console.log(`   ✅ ${data.auditItems.length} سجل`);

    // Save to file
    console.log('\n💾 جاري حفظ البيانات في ملف...');
    fs.writeFileSync('database-export.json', JSON.stringify(data, null, 2));
    console.log('✅ تم حفظ البيانات في database-export.json\n');

    console.log('📊 إجمالي السجلات المُصدَّرة:');
    let total = 0;
    for (const [key, value] of Object.entries(data)) {
      if (value.length > 0) {
        console.log(`   ${key}: ${value.length}`);
        total += value.length;
      }
    }
    console.log(`\n✅ إجمالي: ${total} سجل`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await oldPrisma.$disconnect();
  }
}

exportDatabase().catch(console.error);
