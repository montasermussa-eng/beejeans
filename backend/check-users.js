const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        branchId: true,
      }
    });

    console.log(`📊 Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} (@${user.username})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
      console.log(`   Branch ID: ${user.branchId || 'None'}\n`);
    });

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkUsers();
