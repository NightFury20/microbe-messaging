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
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                }}
            >
                <Flex gap={2}>
                    <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
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
                        type="submit"
                        colorScheme="blue"
                        disabled={!messageInput.trim()}
                    >
                        Send
                    </Button>
                </Flex>
            </form>
        </Box>
    );
}
