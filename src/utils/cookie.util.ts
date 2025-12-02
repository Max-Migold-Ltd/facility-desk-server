import { CookieOptions } from 'express';

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  domain: process.env.COOKIE_DOMAIN,
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in milliseconds
};
