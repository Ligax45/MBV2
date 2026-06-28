import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthSessionService } from '../auth-session.service';
import { MfaService } from '../../infrastructure/mfa.service';
import { TokenService } from '../../infrastructure/token.service';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

export interface VerifyMfaInput {
  mfaSessionToken: string;
  totpCode: string;
}

@Injectable()
export class VerifyMfaUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
    private readonly mfaService: MfaService,
    private readonly authSession: AuthSessionService,
  ) {}

  async execute(input: VerifyMfaInput) {
    const token = input.mfaSessionToken?.trim() ?? '';
    const totpCode = input.totpCode?.trim() ?? '';

    if (!token) {
      throw new BadRequestException('mfaSessionToken is required');
    }
    if (!totpCode) {
      throw new BadRequestException('totpCode is required');
    }

    const userId = await this.tokenService.verifyMfaSessionToken(token);
    const user = await this.userRepo.findById(userId);

    if (!user?.mfaEnabled || !user.mfaSecret) {
      throw new UnauthorizedException('MFA non activée pour ce compte');
    }

    const valid = this.mfaService.verifyToken(user.mfaSecret, totpCode);
    if (!valid) {
      throw new UnauthorizedException('Code TOTP invalide');
    }

    return this.authSession.completeLogin(user.id);
  }
}
