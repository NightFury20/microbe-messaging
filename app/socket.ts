'use client';

import { ClientToServerEvents, ServerToClientEvents } from '@/server';
import { io, Socket } from 'socket.io-client';

const URL =
    process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    URL,
    {
        autoConnect: false,
    },
);
