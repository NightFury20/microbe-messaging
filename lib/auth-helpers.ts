import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { JWT_CONFIG, JWT_ENCODE_OPTIONS } from './jwt-config';
import { prisma } from './prisma';

export async function login(username: string, password: string) {
    // Validate input
    if (!username || !password) {
        redirect(
            `/sign-in?error=${encodeURIComponent(
                'Username and password are required.',
            )}`,
        );
    }

    // Find user
    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        redirect(
            `/sign-in?error=${encodeURIComponent(
                'Invalid username or password.',
            )}`,
        );
    }

    // check password
    const passwordMatches = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordMatches) {
        redirect(
            `/sign-in?error=${encodeURIComponent(
                'Invalid username or password.',
            )}`,
        );
    }

    // Construct token payload
    const returnedUser = {
        id: user.id,
        username: user.username,
    };

    // Sign JWT
    const token = jwt.sign(
        {
            data: returnedUser,
        },
        JWT_CONFIG.secret,
        JWT_ENCODE_OPTIONS,
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token);
}

export async function getToken() {
    const token = (await cookies()).get('token')?.value;
    if (!token) return null;
    return token;
}
