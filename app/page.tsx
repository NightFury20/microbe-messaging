'use client';

import { useEffect } from 'react';
import { socket } from './socket';

export default function Home() {
    useEffect(() => {
        socket.connect();

        socket.on('helloClient', (data) => {
            console.log(data);

            socket.emit('helloServer', `Hello server! From ${socket.id}`);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div>
            <h1>Microbe Messaging</h1>
        </div>
    );
}
