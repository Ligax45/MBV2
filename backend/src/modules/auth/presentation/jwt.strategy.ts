import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole, isUserRole } from '../domain/user-role.enum';
import { JwtKeyService } from '../infrastructure/jwt-key.service';
import type { AuthenticatedUser, JwtPayload } from '../domain/auth-user.model';
import { ACCESS_COOKIE_NAME } from './auth-cookies';

function extractAccessToken(req: Request): string | null {
  const fromCookie = req?.cookies?.[ACCESS_COOKIE_NAME];
  if (typeof fromCookie === 'string' && fromCookie.trim()) {
    return fromCookie.trim();
  }
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(jwtKeyService: JwtKeyService) {
    super({
      jwtFromRequest: extractAccessToken,
      ignoreExpiration: false,
      secretOrKey: jwtKeyService.publicKey,
      algorithms: ['RS256'],
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (payload.typ && payload.typ !== 'access') {
      throw new UnauthorizedException('Type de token invalide');
    }

    const role = payload.role ?? UserRole.User;

    return {
      id: payload.sub,
      pseudo: payload.pseudo ?? '',
      role: isUserRole(role) ? role : UserRole.User,
    };
  }
}
