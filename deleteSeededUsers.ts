import { prisma } from './lib/prisma';

// This will delete ALL users in the database!

// IMPORTANT:
// YOu must delete messages BEFORE deleting users,
// because of foreign key constraints.

// Run this script with:
// npx tsx deleteSeededUsers.ts

async function main() {
    // Create messages
    await prisma.user.deleteMany(); 

    console.log('Deleted all users');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
