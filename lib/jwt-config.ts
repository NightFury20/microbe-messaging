import dotenv from 'dotenv';
import { ExtractJwt } from 'passport-jwt';

dotenv.config({ path: '.env' });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}

export const JWT_CONFIG = {
    algorithm: 'HS256',
    secret: JWT_SECRET,
    issuer: 'microbe.com',
    audience: 'microbe.com',
    expiresIn: '1h',
} as const;

export const JWT_DECODE_OPTIONS = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    algorithm: JWT_CONFIG.algorithm,
    secretOrKey: JWT_CONFIG.secret,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
} as const;

export const JWT_ENCODE_OPTIONS = {
    algorithm: JWT_CONFIG.algorithm,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
    expiresIn: JWT_CONFIG.expiresIn,
};
