import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthSessionService } from '../auth-session.service';
import type { AuthResponse } from '../auth-response.util';
import { MfaService } from '../../infrastructure/mfa.service';
import { TokenService } from '../../infrastructure/token.service';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

export interface ConfirmMfaInput {
  totpCode: string;
  mfaSetupSessionToken?: string;
  userId?: string;
}

@Injectable()
export class ConfirmMfaUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    private readonly mfaService: MfaService,
    private readonly tokenService: TokenService,
    private readonly authSession: AuthSessionService,
  ) {}

  async execute(input: ConfirmMfaInput): Promise<AuthResponse | { success: true }> {
    const totpCode = input.totpCode?.trim() ?? '';
    if (!totpCode) {
      throw new BadRequestException('totpCode is required');
    }

    const userId = await this.resolveUserId(input);
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (!user.mfaSecret) {
      throw new BadRequestException(
        'Configuration MFA non initiée — appelez /auth/mfa/setup d’abord',
      );
    }

    const valid = this.mfaService.verifyToken(user.mfaSecret, totpCode);
    if (!valid) {
      throw new UnauthorizedException('Code TOTP invalide');
    }

    const updated = await this.userRepo.updateMfa(userId, {
      mfaEnabled: true,
      mfaSecret: user.mfaSecret,
    });
    if (!updated) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (input.mfaSetupSessionToken) {
      return this.authSession.completeLogin(userId);
    }

    return { success: true };
  }

  private async resolveUserId(input: ConfirmMfaInput): Promise<string> {
    if (input.userId) {
      return input.userId;
    }

    const token = input.mfaSetupSessionToken?.trim() ?? '';
    if (!token) {
      throw new BadRequestException(
        'Authentification requise ou mfaSetupSessionToken manquant',
      );
    }

    return this.tokenService.verifyMfaSetupSessionToken(token);
  }
}
