import { Message } from './message';
import { User } from './user';

export type Thread = {
    otherUser: User;
    lastMessage: Message;
    unreadCount: number;
};
