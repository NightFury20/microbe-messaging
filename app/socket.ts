'use client';

import { ClientToServerEvents, ServerToClientEvents } from '@/server';
import Cookies from 'js-cookie';
import { io, Socket } from 'socket.io-client';

const URL =
    process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: ClientSocket | null = null;
let currentTokenCache: string | undefined = undefined;

/**
 * Get or create socket with current token.
 * Disconnects old socket if token has changed.
 */
export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
    const currentToken = Cookies.get('token');
    
    // If socket exists and token has changed, disconnect it
    if (socketInstance && currentTokenCache !== currentToken) {
        socketInstance.disconnect();
        socketInstance = null;
    }
    
    // Create new socket if needed
    if (!socketInstance) {
        currentTokenCache = currentToken;
        socketInstance = io(URL, {
            autoConnect: false,
            extraHeaders: currentToken
                ? { authorization: `Bearer ${currentToken}` }
                : {},
        });
    }
    
    return socketInstance;
}

/**
 * Disconnect and clear socket instance.
 * Call this on logout.
 */
export function disconnectSocket() {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        currentTokenCache = undefined;
    }
}

