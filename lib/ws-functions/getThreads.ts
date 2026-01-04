import { Message } from '../data-types/message';
import { Thread } from '../data-types/thread';
import { User } from '../data-types/user';
import { prisma } from '../prisma';

export const getThreads = async (userId: number): Promise<Thread[]> => {
    // Fetch all messages where user is either sender or receiver
    const messages = await prisma.message.findMany({
        where: {
            OR: [{ sentById: userId }, { sentToId: userId }],
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
            createdAt: 'desc',
        },
    });

    // Group messages by conversation partner (thread)
    const threadsMap = new Map<
        number,
        {
            otherUser: User;
            lastMessage: Message;
            unreadCount: number;
            lastMessageTime: Date;
        }
    >();

    for (const message of messages) {
        // Determine who the other participant is
        const otherUser =
            message.sentById === userId ? message.sentTo : message.sentBy;
        const otherUserId = otherUser.id;

        // Check if this message is unread and was sent to the current user
        const isUnread = !message.read && message.sentToId === userId;

        if (!threadsMap.has(otherUserId)) {
            // First message in this thread
            threadsMap.set(otherUserId, {
                otherUser: {
                    id: otherUser.id,
                    username: otherUser.username,
                },
                lastMessage: message,
                unreadCount: isUnread ? 1 : 0,
                lastMessageTime: message.createdAt,
            });
        } else {
            // Thread already exists, just update unread count
            const thread = threadsMap.get(otherUserId)!;
            if (isUnread) {
                thread.unreadCount++;
            }
        }
    }

    // Convert map to array and sort by last message time
    const threads = Array.from(threadsMap.values()).sort((a, b) => {
        return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
    });

    // Remove lastMessageTime from the result (it was only for sorting)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return threads.map(({ lastMessageTime, ...thread }) => thread);
};
