import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthSessionService } from '../auth-session.service';
import { HashingService } from '../../infrastructure/hashing.service';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

export interface LoginInput {
  identifiant: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    private readonly hashingService: HashingService,
    private readonly authSession: AuthSessionService,
  ) {}

  async execute(input: LoginInput) {
    const identifiant = input.identifiant?.trim().toLowerCase() ?? '';
    const password = input.password ?? '';

    if (!identifiant) {
      throw new BadRequestException('identifiant is required');
    }
    if (!password) {
      throw new BadRequestException('password is required');
    }

    const user = await this.userRepo.findByIdentifiant(identifiant);
    if (!user) {
      throw new UnauthorizedException('Identifiant ou mot de passe incorrect');
    }

    const valid = await this.hashingService.verify(user.passwordHash, password);
    if (!valid) {
      throw new UnauthorizedException('Identifiant ou mot de passe incorrect');
    }

    return this.authSession.resolveAfterPassword(user);
  }
}
