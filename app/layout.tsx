import { Provider as ChakraUiProvider } from '@/components/ui/provider';
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
                <ChakraUiProvider>{children}</ChakraUiProvider>
            </body>
        </html>
    );
}
