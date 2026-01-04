"use client";

import { useEffect } from 'react';
import { Box, Container, Heading, VStack, Card } from '@chakra-ui/react';
import LogoutButton from './LogoutButton';
import { socket } from './socket';

export default function AuthedView() {
    useEffect(() => {
        socket.connect();

        socket.on('helloClient', (data) => {
            console.log(data);

            socket.emit('helloServer', `Hello server! From ${socket.id}`);
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
            </VStack>
        </Container>
    );
}
