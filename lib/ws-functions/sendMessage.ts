import { prisma } from '../prisma';

export const sendMessage = async (params: {
    content: string;
    sentById: number;
    sentToId: number;
}) => {
    const { content, sentById, sentToId } = params;

    // Validation 1: Prevent self-messaging
    if (sentById === sentToId) {
        throw new Error('Users cannot send messages to themselves');
    }

    // Validation 2: Verify recipient exists
    const recipientExists = await prisma.user.findUnique({
        where: { id: sentToId },
        select: { id: true },
    });

    if (!recipientExists) {
        throw new Error('Recipient user does not exist');
    }

    // Create the message
    const message = await prisma.message.create({
        data: {
            content,
            sentById,
            sentToId,
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
    });

    return message;
};
