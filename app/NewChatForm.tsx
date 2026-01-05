'use client';

import { Box, Button, Flex, HStack, Input, Spinner, Text, VStack } from '@chakra-ui/react';

interface NewChatFormProps {
    username: string;
    setUsername: (value: string) => void;
    validation: {
        isValidating: boolean;
        isValid: boolean | null;
        errorMessage: string | null;
    };
    onValidate: () => void;
    onStartChat: () => void;
    onCancel: () => void;
}

export default function NewChatForm({
    username,
    setUsername,
    validation,
    onValidate,
    onStartChat,
    onCancel,
}: NewChatFormProps) {
    return (
        <VStack alignItems="stretch" gap={3}>
            <Text fontSize="sm" fontWeight="bold" color="gray.300">
                New Chat
            </Text>
            
            <Input
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                bg="gray.800"
                borderColor="gray.600"
                color="white"
                disabled={validation.isValidating}
                onKeyPress={(e) => {
                    if (e.key === 'Enter' && username.trim()) {
                        onValidate();
                    }
                }}
            />
            
            {!validation.isValid && (
                <Button
                    onClick={onValidate}
                    colorScheme="blue"
                    width="100%"
                    disabled={!username.trim() || validation.isValidating}
                >
                    {validation.isValidating ? (
                        <Flex alignItems="center" gap={2}>
                            <Spinner size="sm" />
                            <Text>Validating...</Text>
                        </Flex>
                    ) : (
                        'Validate'
                    )}
                </Button>
            )}
            
            {validation.isValid === true && (
                <Box p={2} bg="green.900" borderRadius="md" borderWidth="1px" borderColor="green.700">
                    <Text fontSize="sm" color="green.200">
                        ✓ User found: @{username}
                    </Text>
                </Box>
            )}
            
            {validation.isValid === false && validation.errorMessage && (
                <Box p={2} bg="red.900" borderRadius="md" borderWidth="1px" borderColor="red.700">
                    <Text fontSize="sm" color="red.200">
                        {validation.errorMessage}
                    </Text>
                </Box>
            )}
            
            <HStack gap={2}>
                <Button
                    onClick={onStartChat}
                    colorScheme="green"
                    flex="1"
                    disabled={!validation.isValid}
                >
                    Start Chat
                </Button>
                <Button
                    onClick={onCancel}
                    variant="outline"
                    flex="1"
                    colorScheme="gray"
                >
                    Cancel
                </Button>
            </HStack>
        </VStack>
    );
}
