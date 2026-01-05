'use client';

import { Box, Button, Flex, Input } from '@chakra-ui/react';

interface MessageInputProps {
    messageInput: string;
    setMessageInput: (value: string) => void;
    handleSendMessage: () => void;
}

export default function MessageInput({
    messageInput,
    setMessageInput,
    handleSendMessage,
}: MessageInputProps) {
    return (
        <Box
            p={4}
            borderTop="1px solid"
            borderColor="gray.700"
            bg="gray.900"
        >
            <Flex gap={2}>
                <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSendMessage();
                        }
                    }}
                    placeholder="Type a message..."
                    bg="gray.800"
                    borderColor="gray.600"
                    _hover={{ borderColor: 'gray.500' }}
                    _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                    }}
                />
                <Button
                    onClick={handleSendMessage}
                    colorScheme="blue"
                    disabled={!messageInput.trim()}
                >
                    Send
                </Button>
            </Flex>
        </Box>
    );
}
