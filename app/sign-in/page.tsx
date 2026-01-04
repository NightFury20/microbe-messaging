import { getToken, login } from '@/lib/auth-helpers';
import {
    Box,
    Button,
    Container,
    Heading,
    Input,
    VStack,
} from '@chakra-ui/react';
import { redirect } from 'next/navigation';

type SignInPageProps = {
    searchParams: Promise<{ error?: string }>;
};

export default async function SignIn({ searchParams }: SignInPageProps) {
    const session = await getToken();

    // If already logged in, redirect to home
    if (session) {
        redirect('/');
    }

    const params = await searchParams;
    const error = params.error;

    async function handleLogin(formData: FormData) {
        'use server';

        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        await login(username, password);
    }

    return (
        <Container maxW="md" centerContent py={10}>
            <Box w="full" bg="bg.panel" p={8} borderRadius="lg" boxShadow="lg">
                <VStack gap={6} align="stretch">
                    <Heading size="xl" textAlign="center">
                        Sign In
                    </Heading>

                    {error && (
                        <Box
                            p={3}
                            bg="red.100"
                            color="red.800"
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor="red.200"
                        >
                            {error}
                        </Box>
                    )}

                    <form action={handleLogin}>
                        <VStack gap={4} align="stretch">
                            <Input
                                name="username"
                                placeholder="Username"
                                size="lg"
                                required
                            />

                            <Input
                                name="password"
                                type="password"
                                placeholder="Password"
                                size="lg"
                                required
                            />

                            <Button
                                type="submit"
                                colorScheme="blue"
                                size="lg"
                                w="full"
                            >
                                Login
                            </Button>
                        </VStack>
                    </form>
                </VStack>
            </Box>
        </Container>
    );
}
