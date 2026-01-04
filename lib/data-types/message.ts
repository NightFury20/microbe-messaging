import { User } from "./user";

export type Message = {
    id: number;
    content: string;
    createdAt: Date;
    read: boolean;
    sentById: number;
    sentToId: number;
    sentBy: User;
    sentTo: User;
}