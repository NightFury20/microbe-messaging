import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET as string,
    issuer: 'microbe.com',
    audience: 'microbe.com',
    expiresIn: '1h',
} as const;
