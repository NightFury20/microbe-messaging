import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { JWT_CONFIG } from './jwt-config';

export async function login(username: string, password: string) {
    try {
        if (username === 'john' && password === '1234') {
            console.log('authentication OK');

            const user = {
                id: 1,
                username: 'john',
            };

            const token = jwt.sign(
                {
                    data: user,
                },
                JWT_CONFIG.secret,
                {
                    issuer: JWT_CONFIG.issuer,
                    audience: JWT_CONFIG.audience,
                    expiresIn: JWT_CONFIG.expiresIn,
                },
            );

            const cookieStore = await cookies();
            cookieStore.set('token', token);
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Login failed. Please try again.';
        redirect(`/sign-in?error=${encodeURIComponent(errorMessage)}`);
    }
}

export async function getToken() {
    const token = (await cookies()).get('token')?.value;
    if (!token) return null;
    return token;
}
