import type { Response } from 'express';
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  clearAuthCookies,
  setAuthCookies,
} from './auth-cookies';

describe('auth-cookies', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('pose des cookies httpOnly SameSite=lax avec Path=/api', () => {
    process.env.COOKIE_PATH = '/api';
    process.env.COOKIE_SECURE = 'false';

    const cookie = jest.fn();
    const res = { cookie } as unknown as Response;

    setAuthCookies(res, 'access-token', 'refresh-token');

    expect(cookie).toHaveBeenCalledWith(
      ACCESS_COOKIE_NAME,
      'access-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/api',
        secure: false,
      }),
    );
    expect(cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/api',
        secure: false,
      }),
    );
  });

  it('efface les cookies auth', () => {
    process.env.COOKIE_PATH = '/api';
    const clearCookie = jest.fn();
    const res = { clearCookie } as unknown as Response;

    clearAuthCookies(res);

    expect(clearCookie).toHaveBeenCalledWith(
      ACCESS_COOKIE_NAME,
      expect.objectContaining({ path: '/api', httpOnly: true }),
    );
    expect(clearCookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      expect.objectContaining({ path: '/api', httpOnly: true }),
    );
  });
});
