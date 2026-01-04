'use client';

import { ClientToServerEvents, ServerToClientEvents } from '@/server';
import Cookies from 'js-cookie';
import { io, Socket } from 'socket.io-client';

const URL =
    process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';

const token = Cookies.get('token');

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    URL,
    {
        autoConnect: false,
        extraHeaders: {
            authorization: `Bearer ${token}`,
        },
    },
);
