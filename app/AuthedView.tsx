'use client';

import { ClientData } from '@/server';
import { Box, Container, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Header from './Header';
import Loading from './Loading';
import MessagesArea from './MessagesArea';
import ThreadsSidebar from './ThreadsSidebar';
import { getSocket } from './socket';

export default function AuthedView() {
    const [data, setData] = useState<ClientData | null>(null);
    const [openChatUserId, setOpenChatUserId] = useState<number | null>(null);
    const [messageInput, setMessageInput] = useState('');

    // Setup socket connection and listeners
    useEffect(() => {
        const socket = getSocket();
        socket.connect();

        socket.on('sendData', (data) => {
            setData(data);
        });

        return () => {
            // Clean up socket
            socket.off('sendData');
            socket.disconnect();
        };
    }, []);

    // Request data when notified of new data availability
    useEffect(() => {
        const socket = getSocket();
        socket.on('newDataReady', () => {
            socket.emit('requestData', openChatUserId);
        });

        return () => {
            socket.off('newDataReady');
        };
    }, [openChatUserId]);

    // Request data when openChatUserId changes
    useEffect(() => {
        const socket = getSocket();
        socket.emit('requestData', openChatUserId);
    }, [openChatUserId]);

    // Handle sending a message
    const handleSendMessage = () => {
        if (!openChatUserId || !messageInput.trim()) return;

        const socket = getSocket();
        socket.emit('sendMessage', messageInput, openChatUserId);

        setMessageInput('');
    };

    if (!data) {
        return <Loading />;
    }

    const { threads, currentChat, username } = data;

    return (
        <Box minH="100vh" display="flex" flexDirection="column">
            <Header username={username} />

            <Container maxW="container.xl" flex="1" py={0} px={0}>
                <Flex gap={0} h="100%">
                    <ThreadsSidebar
                        threads={threads}
                        onThreadSelect={(thread) =>
                            setOpenChatUserId(thread.otherUser.id)
                        }
                    />

                    <MessagesArea
                        currentChat={currentChat}
                        openChatUserId={openChatUserId}
                        messageInput={messageInput}
                        setMessageInput={setMessageInput}
                        handleSendMessage={handleSendMessage}
                    />
                </Flex>
            </Container>
        </Box>
    );
}
