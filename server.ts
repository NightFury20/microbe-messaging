import next from 'next';
import {
    createServer,
    type IncomingMessage,
    type ServerResponse,
} from 'node:http';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Server } from 'socket.io';
import { JWT_CONFIG } from './lib/jwt-config';

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
}

export interface ClientToServerEvents {
    helloServer: (a: string) => void;
}

const jwtDecodeOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
                passport.authenticate('jwt', { session: false })(
                    req,
                    res,
                    next,
                );
            } else {
                next();
            }
        },
    );

    io.on('connection', (socket) => {
        console.log('new conn:', socket.id, socket.request.user);

        socket.emit('helloClient', `Hello ${socket.id}`);

        socket.on('helloServer', (data) => console.log(data));
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
