import next from 'next';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

export interface ServerToClientEvents {
    helloClient: (a: string) => void;
}

export interface ClientToServerEvents {
    helloServer: (a: string) => void;
}

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server<ClientToServerEvents, ServerToClientEvents>(
        httpServer,
    );

    io.on('connection', (socket) => {
        console.log('new conn:', socket.id);

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
