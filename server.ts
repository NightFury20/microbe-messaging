import next from 'next';
import {
    createServer,
    type IncomingMessage,
    type ServerResponse,
} from 'node:http';
import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { Socket as IOSocket, Server } from 'socket.io';
import { Message } from './lib/data-types/message';
import { Thread } from './lib/data-types/thread';
import { JWT_DECODE_OPTIONS } from './lib/jwt-config';
import { getThreadMessages } from './lib/ws-functions/getThreadMessages';
import { getThreads } from './lib/ws-functions/getThreads';
import { markChatAsRead } from './lib/ws-functions/markChatAsRead';
import { sendMessage } from './lib/ws-functions/sendMessage';

type User = {
    id: number;
    username: string;
};

// Type augmentation for IncomingMessage to include Passport user and Socket.IO query
interface AuthenticatedRequest extends IncomingMessage {
    user?: User; // Added by Passport.js authentication (payload.data from JWT)
    _query: Record<string, string>; // Added by Socket.IO for query parameters
}

// Module augmentation to extend Socket.IO's IncomingMessage type
declare module 'http' {
    interface IncomingMessage {
        user?: User; // Added by Passport.js authentication
    }
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

export type ClientData = {
    username: string;
    threads: Thread[];
    currentChat: Message[];
};

// event types
export interface ServerToClientEvents {
    sendData: (data: ClientData) => void;
    newDataReady: () => void;
}

export interface ClientToServerEvents {
    sendMessage: (content: string, toUserId: number) => void;
    requestData: (selectedChatUserId: number | null) => void;
}

passport.use(
    new JwtStrategy(JWT_DECODE_OPTIONS, (payload, done) => {
        return done(null, payload.data);
    }),
);

type ServerSocket = IOSocket<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    AuthenticatedRequest
>;

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        Record<string, never>,
        AuthenticatedRequest // Socket data type includes our authenticated request
    >(httpServer);

    // Middleware to authenticate socket connections
    io.engine.use(
        (
            req: AuthenticatedRequest,
            res: ServerResponse,
            next: (err?: Error) => void,
        ) => {
            const isHandshake = req._query.sid === undefined;
            if (isHandshake) {
                passport.authenticate(
                    'jwt',
                    { session: false },
                    (err: Error | null, user: User | false) => {
                        if (err || !user) {
                            res.writeHead(401);
                            res.end('Unauthorized');
                            return;
                        }
                        req.user = user;
                        next();
                    },
                )(req, res, next);
            } else {
                next();
            }
        },
    );

    io.on('connection', (socket) => {
        // If user is not authenticated, disconnect the socket
        if (!socket.request.user) {
            console.log('unauthenticated socket connection, disconnecting');
            socket.disconnect();
            return;
        }

        const userRoom = `${socket.request.user.id}`;

        // Add user to their own room to allow new messages to them to trigger "newDataReady" events
        socket.join(userRoom);

        socket.emit('newDataReady');

        socket.on('requestData', handleRequestData(socket));

        socket.on('sendMessage', handleSendMessage(socket));
    });

    httpServer
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});

// Create new Message and emit newDataReady to sender and receiver
function handleSendMessage(
    socket: ServerSocket,
): (content: string, toUserId: number) => void {
    return async (content, sentToId) => {
        const sentById = socket.request.user!.id;

        await sendMessage({
            sentById,
            sentToId,
            content,
        });

        const recievingUserRoom = `${sentToId}`;

        socket.emit('newDataReady');

        socket.to(recievingUserRoom).emit('newDataReady');
    };
}

// Mark current chat as read, fetch threads and current chat messages, and emit to client
function handleRequestData(
    socket: ServerSocket,
): (selectedChatUserId: number | null) => void {
    return async (selectedChatUserId) => {
        const userId = socket.request.user!.id;
        const username = socket.request.user!.username;

        // mark current chat as read and fetch its messages
        let currentChat: Message[] = [];

        if (selectedChatUserId !== null) {
            await markChatAsRead({
                receivingUserId: userId,
                sendingUserId: selectedChatUserId,
            });

            currentChat = await getThreadMessages({
                userId,
                otherUserId: selectedChatUserId,
            });
        }

        // fetch threads after marking currentChat as read
        const threads = await getThreads(userId);

        socket.emit('sendData', {
            username: username,
            threads,
            currentChat,
        });
    };
}
