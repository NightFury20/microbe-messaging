'use client';

import { Thread } from '@/lib/data-types/thread';
import { Badge, Box, Card, HStack, Text, VStack } from '@chakra-ui/react';

interface ThreadsListProps {
    threads: Thread[];
    onThreadSelect: (thread: Thread) => void;
    selectedThreadId: number | null;
}

export default function ThreadsList({
    threads,
    onThreadSelect,
    selectedThreadId,
}: ThreadsListProps) {
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
            {threads.map((thread) => {
                const isSelected = selectedThreadId === thread.otherUser.id;
                return (
                    <Card.Root
                        key={thread.otherUser.id}
                        variant="outline"
                        bg={isSelected ? 'gray.700' : 'transparent'}
                        borderColor={isSelected ? 'gray.500' : 'gray.700'}
                        _hover={{ bg: isSelected ? 'gray.600' : 'gray.500', cursor: 'pointer' }}
                        transition="all 0.2s"
                        onClick={() => onThreadSelect(thread)}
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
                                    {new Date(
                                        thread.lastMessage.createdAt,
                                    ).toLocaleDateString()}
                                </Text>
                            </VStack>
                        </HStack>
                    </Card.Body>
                </Card.Root>
                );
            })}
        </VStack>
    );
}
