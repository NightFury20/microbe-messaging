'use client';

import { Box, Container, Flex, Heading } from '@chakra-ui/react';
import LogoutButton from './LogoutButton';

interface HeaderProps {
    username: string;
}

export default function Header({ username }: HeaderProps) {
    return (
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
                        Microbe Messaging - {username}
                    </Heading>
                    <LogoutButton />
                </Flex>
            </Container>
        </Box>
    );
}
