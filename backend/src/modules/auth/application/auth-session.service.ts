import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AuthResponse } from './auth-response.util';
import {
  toAuthSuccessResponse,
  toMfaRequiredResponse,
  toMfaSetupRequiredResponse,
} from './auth-response.util';
import { TokenService } from '../infrastructure/token.service';
import type { UserRecord } from '../domain/repositories/user.repository';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../domain/repositories/user.repository';

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly tokenService: TokenService,
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
  ) {}

  async resolveAfterPassword(user: UserRecord): Promise<AuthResponse> {
    if (user.requiresMfa && !user.mfaEnabled) {
      const mfaSetupSessionToken =
        await this.tokenService.createMfaSetupSessionToken(user.id);
      return toMfaSetupRequiredResponse(mfaSetupSessionToken);
    }

    if (user.mfaEnabled) {
      const mfaSessionToken =
        await this.tokenService.createMfaSessionToken(user.id);
      return toMfaRequiredResponse(mfaSessionToken);
    }

    const tokens = await this.tokenService.issueAuthTokens(user);
    return toAuthSuccessResponse(tokens, user);
  }

  async completeLogin(userId: string): Promise<AuthResponse> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const tokens = await this.tokenService.issueAuthTokens(user);
    return toAuthSuccessResponse(tokens, user);
  }
}
