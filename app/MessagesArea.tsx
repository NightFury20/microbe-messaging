'use client';

import { Message } from '@/lib/data-types/message';
import { Box } from '@chakra-ui/react';
import MessageInput from './MessageInput';
import { MessagesList } from './MessagesList';

interface MessagesAreaProps {
    currentChat: Message[];
    openChatUserId: number | null;
    messageInput: string;
    setMessageInput: (value: string) => void;
    handleSendMessage: () => void;
}

export default function MessagesArea({
    currentChat,
    openChatUserId,
    messageInput,
    setMessageInput,
    handleSendMessage,
}: MessagesAreaProps) {
    return (
        <Box
            flex="2"
            bg="gray.800"
            height="100%"
            display="flex"
            flexDirection="column"
        >
            <Box flex="1" overflowY="auto">
                <MessagesList messages={currentChat} />
            </Box>

            {/* Message Input UI - Only visible when thread is selected */}
            {openChatUserId && (
                <MessageInput
                    messageInput={messageInput}
                    setMessageInput={setMessageInput}
                    handleSendMessage={handleSendMessage}
                />
            )}
        </Box>
    );
}
