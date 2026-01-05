'use client';

import { Thread } from '@/lib/data-types/thread';
import { Box } from '@chakra-ui/react';
import ThreadsList from './ThreadsList';

interface ThreadsSidebarProps {
    threads: Thread[];
    onThreadSelect: (thread: Thread) => void;
}

export default function ThreadsSidebar({
    threads,
    onThreadSelect,
}: ThreadsSidebarProps) {
    return (
        <Box
            flex="1"
            minW="300px"
            maxW="400px"
            bg="gray.900"
            borderRight="1px solid"
            borderColor="gray.700"
            height="100%"
        >
            <ThreadsList threads={threads} onThreadSelect={onThreadSelect} />
        </Box>
    );
}
