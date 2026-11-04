import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function parseCorsOrigins(raw?: string): string[] {
  const fromEnv = (raw ?? process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (fromEnv.length > 0) {
    return fromEnv;
  }

  return ['http://localhost:4200'];
}

function extractOrigin(req: Request): string | null {
  const origin = req.headers.origin?.trim();
  if (origin) return origin;

  const referer = req.headers.referer?.trim();
  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

/** Rejette les mutations cross-origin hors allowlist (complément SameSite). */
@Injectable()
export class CsrfOriginMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    if (!MUTATING_METHODS.has(req.method.toUpperCase())) {
      next();
      return;
    }

    const allowed = parseCorsOrigins();
    const requestOrigin = extractOrigin(req);

    // Requêtes same-origin via proxy / outils sans Origin (ex. curl) : autorisées.
    if (!requestOrigin) {
      next();
      return;
    }

    if (!allowed.includes(requestOrigin)) {
      next(new ForbiddenException('Origin non autorisée'));
      return;
    }

    next();
  }
}
