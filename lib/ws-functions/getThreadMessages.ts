import { Message } from '../data-types/message';
import { prisma } from '../prisma';

export const getThreadMessages = async (params: {
    userId: number;
    otherUserId: number;
}): Promise<Message[]> => {
    const { userId, otherUserId } = params;

    // Fetch all messages between the two users
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                {
                    sentById: userId,
                    sentToId: otherUserId,
                },
                {
                    sentById: otherUserId,
                    sentToId: userId,
                },
            ],
        },
        include: {
            sentBy: {
                select: {
                    id: true,
                    username: true,
                },
            },
            sentTo: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
        orderBy: {
            createdAt: 'asc', // Oldest first
        },
    });

    return messages;
};
