import { randomBytes, randomUUID } from 'crypto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../domain/repositories/user.repository';
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from '../domain/repositories/refresh-token.repository';
import { HashingService } from './hashing.service';
import type { UserRecord } from '../domain/repositories/user.repository';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MFA_SESSION_TTL = '5m';
const MFA_SETUP_SESSION_TTL = '15m';

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  user: Pick<UserRecord, 'id' | 'pseudo' | 'mfaEnabled' | 'role'>;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashingService: HashingService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepo: RefreshTokenRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
  ) {}

  async issueAuthTokens(
    user: Pick<UserRecord, 'id' | 'pseudo' | 'mfaEnabled' | 'role'>,
  ): Promise<IssuedTokens> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        pseudo: user.pseudo,
        mfaEnabled: user.mfaEnabled,
        role: user.role,
      },
    };
  }

  async signAccessToken(
    user: Pick<UserRecord, 'id' | 'pseudo' | 'role'>,
  ): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      pseudo: user.pseudo,
      role: user.role,
      typ: 'access',
    });
  }

  async createMfaSessionToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, typ: 'mfa_pending' },
      { expiresIn: MFA_SESSION_TTL },
    );
  }

  async createMfaSetupSessionToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, typ: 'mfa_setup' },
      { expiresIn: MFA_SETUP_SESSION_TTL },
    );
  }

  async verifyMfaSessionToken(token: string): Promise<string> {
    return this.verifyTypedToken(token, 'mfa_pending');
  }

  async verifyMfaSetupSessionToken(token: string): Promise<string> {
    return this.verifyTypedToken(token, 'mfa_setup');
  }

  async refresh(refreshToken: string): Promise<IssuedTokens> {
    const parsed = this.parseRefreshToken(refreshToken);
    const record = await this.refreshTokenRepo.findById(parsed.id);

    if (!record || record.revokedAt) {
      throw new UnauthorizedException('Refresh token invalide');
    }
    if (record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expiré');
    }

    const valid = await this.hashingService.verify(
      record.tokenHash,
      parsed.secret,
    );
    if (!valid) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const user = await this.userRepo.findById(record.userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    await this.refreshTokenRepo.revoke(record.id);

    const accessToken = await this.signAccessToken(user);
    const newRefreshToken = await this.createRefreshToken(user.id);
    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        pseudo: user.pseudo,
        mfaEnabled: user.mfaEnabled,
        role: user.role,
      },
    };
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const parsed = this.parseRefreshToken(refreshToken);
      await this.refreshTokenRepo.revoke(parsed.id);
    } catch {
      // Token malformé — rien à révoquer
    }
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const id = randomUUID();
    const secret = randomBytes(32).toString('base64url');
    const tokenHash = await this.hashingService.hash(secret);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await this.refreshTokenRepo.create({
      id,
      userId,
      tokenHash,
      expiresAt,
    });

    return `${id}.${secret}`;
  }

  private parseRefreshToken(token: string): { id: string; secret: string } {
    const dotIndex = token.indexOf('.');
    if (dotIndex <= 0) {
      throw new UnauthorizedException('Refresh token malformé');
    }

    const id = token.slice(0, dotIndex);
    const secret = token.slice(dotIndex + 1);
    if (!id || !secret) {
      throw new UnauthorizedException('Refresh token malformé');
    }

    return { id, secret };
  }

  private async verifyTypedToken(
    token: string,
    expectedType: string,
  ): Promise<string> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        typ?: string;
      }>(token);

      if (payload.typ !== expectedType || !payload.sub) {
        throw new UnauthorizedException('Session MFA invalide');
      }

      return payload.sub;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Session MFA invalide ou expirée');
    }
  }
}

export { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL_MS };
