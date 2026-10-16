// Verify Prisma Client is working properly
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyPrisma() {
  try {
    console.log('🔍 Verifying Prisma Client...\n');
    
    // Check database connection
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // Try to query officeReturn table
    console.log('📋 Checking office_returns table...');
    const officeReturnsCount = await prisma.officeReturn.count();
    console.log(`✅ office_returns table exists: ${officeReturnsCount} records\n`);
    
    // Try to query customerStoreReturn table
    console.log('📋 Checking customer_store_returns table...');
    const storeReturnsCount = await prisma.customerStoreReturn.count();
    console.log(`✅ customer_store_returns table exists: ${storeReturnsCount} records\n`);
    
    console.log('🎉 All checks passed! Prisma Client is working correctly.\n');
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error('\nFull error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

verifyPrisma();
