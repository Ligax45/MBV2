import type { CookieOptions, Response } from 'express';

export const ACCESS_COOKIE_NAME = 'mb_access';
export const REFRESH_COOKIE_NAME = 'mb_refresh';

const ACCESS_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function getCookiePath(): string {
  return process.env.COOKIE_PATH?.trim() || '/api';
}

export function isCookieSecure(): boolean {
  if (process.env.COOKIE_SECURE === 'true') return true;
  if (process.env.COOKIE_SECURE === 'false') return false;
  return process.env.NODE_ENV === 'production';
}

function baseCookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isCookieSecure(),
    sameSite: 'lax',
    path: getCookiePath(),
    maxAge: maxAgeMs,
  };
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, baseCookieOptions(ACCESS_MAX_AGE_MS));
  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    baseCookieOptions(REFRESH_MAX_AGE_MS),
  );
}

export function clearAuthCookies(res: Response): void {
  const path = getCookiePath();
  const secure = isCookieSecure();
  res.clearCookie(ACCESS_COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path,
  });
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path,
  });
}
