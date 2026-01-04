import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

export default function Loading() {
    return (
        <Center minH="100vh" w="100%" bg="bg">
            <VStack gap={4}>
                <Spinner size="xl" colorPalette="blue" />
                <Text fontSize="lg" color="fg.muted">
                    Loading...
                </Text>
            </VStack>
        </Center>
    );
}
