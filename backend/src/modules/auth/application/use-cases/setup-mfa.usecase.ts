import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MfaService } from '../../infrastructure/mfa.service';
import { TokenService } from '../../infrastructure/token.service';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

export interface SetupMfaInput {
  mfaSetupSessionToken?: string;
  userId?: string;
}

@Injectable()
export class SetupMfaUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    private readonly mfaService: MfaService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: SetupMfaInput) {
    const userId = await this.resolveUserId(input);
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (user.mfaEnabled) {
      throw new BadRequestException('MFA déjà activée');
    }

    const secret = this.mfaService.generateSecret();
    await this.userRepo.updateMfa(userId, {
      mfaEnabled: false,
      mfaSecret: secret,
    });

    return {
      secret,
      otpauthUri: this.mfaService.buildOtpAuthUri(user.identifiant, secret),
    };
  }

  private async resolveUserId(input: SetupMfaInput): Promise<string> {
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
