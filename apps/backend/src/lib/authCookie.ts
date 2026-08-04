import { Response } from 'express';

export const AUTH_COOKIE_NAME = 'token';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün — signToken'daki expiresIn ile aynı

/**
 * JWT'yi httpOnly bir cookie olarak yazar. JS'ten okunamaz (XSS ile token
 * sızdırma riskini kaldırır) — sadece tarayıcı, aynı-site isteklerde otomatik
 * gönderir. `secure` üretimde zorunlu; yerel http geliştirmede false olmalı
 * yoksa tarayıcı cookie'yi hiç kabul etmez.
 */
export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_MS,
    path: '/',
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
