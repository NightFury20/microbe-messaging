import { prisma } from '../prisma';

export const validateUserName = async (username: string): Promise<{ isValid: boolean, userId: number | null }> => {
    const user = await prisma.user.findUnique({
        where: { username },
    });

    return {
        isValid: !user,
        userId: user?.id || null
    };
};
