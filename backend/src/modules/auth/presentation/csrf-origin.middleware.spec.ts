import { ForbiddenException } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import {
  CsrfOriginMiddleware,
  parseCorsOrigins,
} from './csrf-origin.middleware';

describe('CsrfOriginMiddleware', () => {
  const originalEnv = { ...process.env };
  let middleware: CsrfOriginMiddleware;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    process.env = { ...originalEnv, CORS_ORIGINS: 'http://localhost:4200' };
    middleware = new CsrfOriginMiddleware();
    next = jest.fn();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('parseCorsOrigins lit la liste env', () => {
    expect(parseCorsOrigins('https://a.test, https://b.test')).toEqual([
      'https://a.test',
      'https://b.test',
    ]);
  });

  it('laisse passer GET sans contrôle Origin', () => {
    const req = {
      method: 'GET',
      headers: { origin: 'https://evil.example' },
    } as unknown as Request;

    middleware.use(req, {} as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('laisse passer POST sans Origin (curl / same-origin proxy)', () => {
    const req = {
      method: 'POST',
      headers: {},
    } as unknown as Request;

    middleware.use(req, {} as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('rejette POST avec Origin hors allowlist', () => {
    const req = {
      method: 'POST',
      headers: { origin: 'https://evil.example' },
    } as unknown as Request;

    middleware.use(req, {} as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenException));
  });

  it('autorise POST depuis une Origin allowlist', () => {
    const req = {
      method: 'POST',
      headers: { origin: 'http://localhost:4200' },
    } as unknown as Request;

    middleware.use(req, {} as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
