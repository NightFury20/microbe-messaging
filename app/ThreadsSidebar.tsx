'use client';

import { Thread } from '@/lib/data-types/thread';
import { Box, Button } from '@chakra-ui/react';
import { useState } from 'react';
import NewChatForm from './NewChatForm';
import ThreadsList from './ThreadsList';

interface ThreadsSidebarProps {
    threads: Thread[];
    onThreadSelect: (thread: Thread) => void;
    onStartNewChat: (userId: number) => void; // Callback when user starts a new chat
    onValidateUsername: (
        username: string,
        callback: (data: { isValid: boolean; userId: number | null }) => void
    ) => void; // Pass through the validation function
    selectedThreadId: number | null; // ID of the currently selected thread
}

export default function ThreadsSidebar({
    threads,
    onThreadSelect,
    onStartNewChat,
    onValidateUsername,
    selectedThreadId,
}: ThreadsSidebarProps) {
    const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
    const [newChatUsername, setNewChatUsername] = useState('');
    const [newChatValidation, setNewChatValidation] = useState<{
        isValidating: boolean;
        isValid: boolean | null;
        validatedUserId: number | null;
        errorMessage: string | null;
    }>({
        isValidating: false,
        isValid: null,
        validatedUserId: null,
        errorMessage: null,
    });

    const handleNewChatClick = () => {
        setIsCreatingNewChat(true);
    };

    const handleValidateUsername = () => {
        if (!newChatUsername.trim()) {
            setNewChatValidation({
                isValidating: false,
                isValid: false,
                validatedUserId: null,
                errorMessage: 'Please enter a username',
            });
            return;
        }

        setNewChatValidation({
            isValidating: true,
            isValid: null,
            validatedUserId: null,
            errorMessage: null,
        });
        
        onValidateUsername(newChatUsername, (result) => {
            if (result.userId) {
                setNewChatValidation({
                    isValidating: false,
                    isValid: true,
                    validatedUserId: result.userId,
                    errorMessage: null,
                });
            } else {
                setNewChatValidation({
                    isValidating: false,
                    isValid: false,
                    validatedUserId: null,
                    errorMessage: 'User not found',
                });
            }
        });
    };

    const handleStartChat = () => {
        if (newChatValidation.validatedUserId) {
            // Check if thread already exists
            const existingThread = threads.find(
                t => t.otherUser.id === newChatValidation.validatedUserId
            );
            
            if (existingThread) {
                // Thread exists, just select it
                resetNewChatState();
                onThreadSelect(existingThread);
            } else {
                // New thread, call parent callback
                onStartNewChat(newChatValidation.validatedUserId);
                resetNewChatState();
            }
        }
    };

    const handleCancelNewChat = () => {
        resetNewChatState();
    };

    const resetNewChatState = () => {
        setIsCreatingNewChat(false);
        setNewChatUsername('');
        setNewChatValidation({
            isValidating: false,
            isValid: null,
            validatedUserId: null,
            errorMessage: null,
        });
    };

    return (
        <Box
            flex="1"
            minW="300px"
            maxW="400px"
            bg="gray.900"
            borderRight="1px solid"
            borderColor="gray.700"
            height="100%"
            display="flex"
            flexDirection="column"
        >
            {/* Header with New Chat button */}
            <Box p={4} borderBottom="1px solid" borderColor="gray.700">
                <Button
                    onClick={handleNewChatClick}
                    colorScheme="blue"
                    width="100%"
                    disabled={isCreatingNewChat}
                >
                    + New Chat
                </Button>
            </Box>
            
            {/* New Chat Form (conditional) */}
            {isCreatingNewChat && (
                <Box p={4} borderBottom="1px solid" borderColor="gray.700" bg="gray.800">
                    <NewChatForm
                        username={newChatUsername}
                        setUsername={setNewChatUsername}
                        validation={{
                            isValidating: newChatValidation.isValidating,
                            isValid: newChatValidation.isValid,
                            errorMessage: newChatValidation.errorMessage,
                        }}
                        onValidate={handleValidateUsername}
                        onStartChat={handleStartChat}
                        onCancel={handleCancelNewChat}
                    />
                </Box>
            )}
            
            {/* Thread List */}
            <Box flex="1" overflowY="auto">
                <ThreadsList
                    threads={threads}
                    onThreadSelect={onThreadSelect}
                    selectedThreadId={selectedThreadId}
                />
            </Box>
        </Box>
    );
}
