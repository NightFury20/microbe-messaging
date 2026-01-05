import { prisma } from '../prisma';

export const markChatAsRead = async (params: {
    receivingUserId: number;
    sendingUserId: number;
}): Promise<void> => {
    const { receivingUserId, sendingUserId } = params;

    // Mark messages in this chat to the requesting user as read
    await prisma.message.updateMany({
        where: {
            sentById: sendingUserId,
            sentToId: receivingUserId,
            read: false,
        },
        data: {
            read: true,
        },
    });
};
