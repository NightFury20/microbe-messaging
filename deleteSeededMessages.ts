import { prisma } from './lib/prisma';

// This will delete ALL messages in the database!

// Run this script with:
// npx tsx deleteSeededMessages.ts

async function main() {
    // Create messages
    await prisma.message.deleteMany();

    console.log('Deleted all messages');
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
