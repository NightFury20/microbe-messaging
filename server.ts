import next from 'next';
import {
    createServer,
    type IncomingMessage,
    type ServerResponse,
} from 'node:http';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Server } from 'socket.io';
import { Message } from './lib/data-types/message';
import { Thread } from './lib/data-types/thread';
import { JWT_CONFIG } from './lib/jwt-config';
import { getThreadMessages } from './lib/ws-functions/getThreadMessages';
import { getThreads } from './lib/ws-functions/getThreads';

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

// event types
export interface ServerToClientEvents {
    helloClient: (a: string) => void;
    sendThreads: (threads: Thread[]) => void;
    sendThreadMessages: (messages: Message[]) => void;
}

export interface ClientToServerEvents {
    requestThreads: () => void;
    requestThreadMessages: (otherUserId: number) => void;
}

const jwtDecodeOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    algorithm: JWT_CONFIG.algorithm,
    secretOrKey: JWT_CONFIG.secret,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
};

passport.use(
    new JwtStrategy(jwtDecodeOptions, (payload, done) => {
        return done(null, payload.data);
    }),
);

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        Record<string, never>,
        AuthenticatedRequest // Socket data type includes our authenticated request
    >(httpServer);

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
        console.log('new conn:', socket.id, socket.request.user);

        if (!socket.request.user) {
            console.log('unauthenticated socket connection, disconnecting');
            socket.disconnect();
            return;
        }

        socket.on('requestThreads', async () => {
            const threads = await getThreads(socket.request.user!.id);

            socket.emit('sendThreads', threads);
        });

        socket.on('requestThreadMessages', async (otherUserId) => {
            const messages = await getThreadMessages({
                userId: socket.request.user!.id,
                otherUserId,
            });

            socket.emit('sendThreadMessages', messages);
        });
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
