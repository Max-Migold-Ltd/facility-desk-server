import jwt from 'jsonwebtoken';
import { AccessTokenPayload, RefreshTokenPayload } from '../types/jwt-payload';

const jwtConfig = {
  access: {
    secret: process.env.JWT_ACCESS_SECRET!,
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d'
  }
};

export function generateAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    jwtConfig.access.secret,
    { expiresIn: jwtConfig.access.expiresIn }
  );
}

export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    jwtConfig.refresh.secret,
    { expiresIn: jwtConfig.refresh.expiresIn }
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, jwtConfig.access.secret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, jwtConfig.refresh.secret) as RefreshTokenPayload;
}
