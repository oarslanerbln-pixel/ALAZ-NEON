import { Response, CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'token';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün — signToken'daki expiresIn ile aynı

// 'lax' doğru varsayılan: frontend ve backend aynı site'ta olduğunda (ör.
// app.example.com + api.example.com — kayıtlı alan adı aynı) bu yeterli ve
// daha güvenli. Yalnızca frontend/backend gerçekten farklı site'larda
// çalışıyorsa (ör. iki bağımsız *.vercel.app deploy'u) 'none' override'ı
// gerekir — SameSite=None tarayıcı tarafından yalnızca Secure ile kabul
// edilir, bu yüzden bu durumda secure otomatik zorlanıyor.
const sameSite = (process.env.COOKIE_SAME_SITE as CookieOptions['sameSite']) || 'lax';

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: sameSite === 'none' || process.env.NODE_ENV === 'production',
    sameSite,
    path: '/',
  };
}

/**
 * JWT'yi httpOnly bir cookie olarak yazar. JS'ten okunamaz (XSS ile token
 * sızdırma riskini kaldırır) — sadece tarayıcı, izin verilen isteklerde
 * otomatik gönderir.
 */
export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, { ...cookieOptions(), maxAge: MAX_AGE_MS });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions());
}
