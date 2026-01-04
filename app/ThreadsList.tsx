"use client";

import { Box, Card, Text, VStack, Badge, HStack } from '@chakra-ui/react';
import { Thread } from '@/lib/data-types/thread';

interface ThreadsListProps {
    threads: Thread[];
}

export default function ThreadsList({ threads }: ThreadsListProps) {
    if (threads.length === 0) {
        return (
            <Box textAlign="center" py={8}>
                <Text fontSize="lg" color="gray.500">
                    No threads yet. Start a conversation!
                </Text>
            </Box>
        );
    }

    return (
        <VStack gap={4} align="stretch">
            {threads.map((thread, index) => (
                <Card.Root
                    key={index}
                    variant="outline"
                    _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                    transition="background 0.2s"
                >
                    <Card.Body>
                        <HStack justify="space-between" align="start">
                            <VStack align="start" gap={1} flex={1}>
                                <Text fontWeight="bold" fontSize="lg">
                                    {thread.otherUser.username}
                                </Text>
                                <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                >
                                    {thread.lastMessage.content}
                                </Text>
                            </VStack>
                            <VStack align="end" gap={2}>
                                {thread.unreadCount > 0 && (
                                    <Badge colorScheme="blue" variant="solid">
                                        {thread.unreadCount}
                                    </Badge>
                                )}
                                <Text fontSize="xs" color="gray.500">
                                    {new Date(thread.lastMessage.createdAt).toLocaleDateString()}
                                </Text>
                            </VStack>
                        </HStack>
                    </Card.Body>
                </Card.Root>
            ))}
        </VStack>
    );
}
