"use client";

import { useEffect, useState } from 'react';
import { Box, Container, Heading, VStack, Card } from '@chakra-ui/react';
import LogoutButton from './LogoutButton';
import ThreadsList from './ThreadsList';
import { socket } from './socket';
import { Thread } from '@/lib/data-types/thread';

export default function AuthedView() {
    const [threads, setThreads] = useState<Thread[]>([]);

    useEffect(() => {
        socket.connect();

        socket.emit('requestThreads');

        socket.on('sendThreads', (threads) => {
            setThreads(threads);
        });

        return () => {
            // Cleans up all event listeners and disconnects the socket
            socket.disconnect();
        };
    }, []);

    return (
        <Container maxW="container.md" py={10}>
            <VStack gap={8}>
                <Card.Root width="100%" shadow="lg">
                    <Card.Body>
                        <VStack gap={6} align="stretch">
                            <Heading
                                as="h1"
                                size="2xl"
                                textAlign="center"
                                color="white"
                            >
                                Authed View
                            </Heading>
                            
                            <Box textAlign="center" pt={4}>
                                <LogoutButton />
                            </Box>
                        </VStack>
                    </Card.Body>
                </Card.Root>

                <Card.Root width="100%" shadow="lg">
                    <Card.Body>
                        <VStack gap={4} align="stretch">
                            <Heading as="h2" size="lg" color="white">
                                Threads
                            </Heading>
                            <ThreadsList threads={threads} />
                        </VStack>
                    </Card.Body>
                </Card.Root>
            </VStack>
        </Container>
    );
}
