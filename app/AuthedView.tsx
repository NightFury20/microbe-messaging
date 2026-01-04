'use client';

import { Message } from '@/lib/data-types/message';
import { Thread } from '@/lib/data-types/thread';
import { Box, Container, Flex, Heading } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import LogoutButton from './LogoutButton';
import { MessagesList } from './MessagesList';
import ThreadsList from './ThreadsList';
import { getSocket } from './socket';

export default function AuthedView() {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [threadMessages, setThreadMessages] = useState<Message[]>([]);
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

    useEffect(() => {
        const socket = getSocket();
        socket.connect();

        
        socket.on('sendThreads', (threads) => {
            setThreads(threads);
        });
        socket.emit('requestThreads');

        return () => {
            // Clean up event listeners and disconnects the socket
            socket.disconnect();
            socket.off('sendThreads');
        };
    }, []);

    useEffect(() => {
        if (!selectedThread) return;

        const socket = getSocket();
        const currentUserId = selectedThread.otherUser.id;

        socket.on('sendThreadMessages', (messages) => {
            // Only update if this is still the selected thread
            if (selectedThread?.otherUser.id === currentUserId) {
                setThreadMessages(messages);
            }
        });

        socket.emit('requestThreadMessages', currentUserId);

        return () => {
            socket.off('sendThreadMessages');
        };
    }, [selectedThread]);

    return (
        <Box minH="100vh" display="flex" flexDirection="column">
            {/* Header Section */}
            <Box
                width="100%"
                bg="gray.800"
                borderBottom="1px solid"
                borderColor="gray.700"
                py={4}
            >
                <Container maxW="container.xl">
                    <Flex justify="space-between" align="center">
                        <Heading as="h1" size="xl" color="white">
                            User Name
                        </Heading>
                        <LogoutButton />
                    </Flex>
                </Container>
            </Box>

            {/* Two-Column Layout */}
            <Container maxW="container.xl" flex="1" py={0} px={0}>
                <Flex gap={0} h="100%">
                    {/* Left Column - Threads Sidebar */}
                    <Box
                        flex="1"
                        minW="300px"
                        maxW="400px"
                        bg="gray.900"
                        borderRight="1px solid"
                        borderColor="gray.700"
                        height="100%"
                    >
                        <ThreadsList
                            threads={threads}
                            onThreadSelect={(thread) =>
                                setSelectedThread(thread)
                            }
                        />
                    </Box>

                    {/* Right Column - Messages Area */}
                    <Box flex="2" bg="gray.800" height="100%">
                        <MessagesList messages={threadMessages} />
                    </Box>
                </Flex>
            </Container>
        </Box>
    );
}
