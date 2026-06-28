import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../domain/user-role.enum';
import { JwtKeyService } from '../infrastructure/jwt-key.service';
import type { AuthenticatedUser, JwtPayload } from '../domain/auth-user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(jwtKeyService: JwtKeyService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtKeyService.publicKey,
      algorithms: ['RS256'],
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (payload.typ && payload.typ !== 'access') {
      throw new UnauthorizedException('Type de token invalide');
    }

    return {
      id: payload.sub,
      pseudo: payload.pseudo ?? '',
      role: payload.role ?? UserRole.User,
    };
  }
}
