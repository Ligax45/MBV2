import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AuthSessionService } from '../auth-session.service';
import { HashingService } from '../../infrastructure/hashing.service';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

export interface RegisterInput {
  identifiant: string;
  pseudo: string;
  password: string;
}

const MIN_PASSWORD_LENGTH = 8;

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    private readonly hashingService: HashingService,
    private readonly authSession: AuthSessionService,
  ) {}

  async execute(input: RegisterInput) {
    const identifiant = input.identifiant?.trim() ?? '';
    const pseudo = input.pseudo?.trim() ?? '';
    const password = input.password ?? '';

    if (!identifiant) {
      throw new BadRequestException('identifiant is required');
    }
    if (identifiant.length < 3 || identifiant.length > 50) {
      throw new BadRequestException(
        'identifiant must be between 3 and 50 characters',
      );
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(identifiant)) {
      throw new BadRequestException(
        'identifiant may only contain letters, numbers, dots, underscores and hyphens',
      );
    }

    if (!pseudo) {
      throw new BadRequestException('pseudo is required');
    }
    if (pseudo.length < 2 || pseudo.length > 50) {
      throw new BadRequestException('pseudo must be between 2 and 50 characters');
    }

    if (!password) {
      throw new BadRequestException('password is required');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(
        `password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      );
    }

    const existing = await this.userRepo.findByIdentifiant(
      identifiant.toLowerCase(),
    );
    if (existing) {
      throw new ConflictException('Cet identifiant est déjà utilisé');
    }

    const passwordHash = await this.hashingService.hash(password);
    const user = await this.userRepo.create({
      identifiant: identifiant.toLowerCase(),
      pseudo,
      passwordHash,
    });

    return this.authSession.resolveAfterPassword(user);
  }
}
