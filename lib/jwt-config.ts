import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
}

export const JWT_CONFIG = {
    algorithm: 'HS256',
    secret: jwtSecret,
    issuer: 'microbe.com',
    audience: 'microbe.com',
    expiresIn: '1h',
} as const;
