import { prisma } from './lib/prisma';

// The database have already been seeded with the users in `seedUsers.ts`:
// 'peter'
// 'benjamin'
// 'jess'
// 'tom'

// Run this script with:
// npx tsx seedMessages.ts

const createMessage = async (
    fromUserName: string,
    toUserName: string,
    content: string,
) => {
    const fromUser = await prisma.user.findFirst({
        where: { username: fromUserName },
    });
    const toUser = await prisma.user.findFirst({
        where: { username: toUserName },
    });

    if (!fromUser || !toUser) {
        throw new Error('Could not find users');
    }

    const message = await prisma.message.create({
        data: { content, sentById: fromUser.id, sentToId: toUser.id },
    });

    console.log('Created message:', message);
};

async function main() {
    // Create messages
    await createMessage('peter', 'benjamin', 'Do you see my message?');
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
