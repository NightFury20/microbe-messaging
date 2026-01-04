import { Provider as ChakraUiProvider } from '@/components/ui/provider';
import { Box, Heading } from '@chakra-ui/react';
import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
    title: 'Microbe Messaging',
    description: 'A simple messaging demo',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ChakraUiProvider>
                    <Box textAlign="center" py={4}>
                        <Heading as="h1" size="2xl">
                            Microbe Messaging
                        </Heading>
                    </Box>

                    {children}
                </ChakraUiProvider>
            </body>
        </html>
    );
}
