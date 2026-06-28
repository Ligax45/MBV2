import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingService } from '../../infrastructure/hashing.service';
import { MfaService } from '../../infrastructure/mfa.service';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

export interface DisableMfaInput {
  userId: string;
  password: string;
  totpCode: string;
}

@Injectable()
export class DisableMfaUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    private readonly hashingService: HashingService,
    private readonly mfaService: MfaService,
  ) {}

  async execute(input: DisableMfaInput) {
    const password = input.password ?? '';
    const totpCode = input.totpCode?.trim() ?? '';

    if (!password) {
      throw new BadRequestException('password is required');
    }
    if (!totpCode) {
      throw new BadRequestException('totpCode is required');
    }

    const user = await this.userRepo.findById(input.userId);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (!user.mfaEnabled || !user.mfaSecret) {
      throw new BadRequestException('MFA non activée');
    }

    if (user.requiresMfa) {
      throw new BadRequestException(
        'MFA obligatoire pour ce compte sensible — désactivation impossible',
      );
    }

    const validPassword = await this.hashingService.verify(
      user.passwordHash,
      password,
    );
    if (!validPassword) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    const validTotp = this.mfaService.verifyToken(user.mfaSecret, totpCode);
    if (!validTotp) {
      throw new UnauthorizedException('Code TOTP invalide');
    }

    await this.userRepo.updateMfa(user.id, {
      mfaEnabled: false,
      mfaSecret: null,
    });

    return { success: true };
  }
}
