import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../domain/auth-user.model';
import { UserRole, isUserRole } from '../../domain/user-role.enum';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

@Injectable()
export class UpdateUserRoleUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
  ) {}

  async execute(actor: AuthenticatedUser, targetUserId: string, role: string) {
    const trimmedId = targetUserId?.trim() ?? '';
    if (!trimmedId) {
      throw new BadRequestException('id is required');
    }

    if (!isUserRole(role)) {
      throw new BadRequestException('role is invalid');
    }

    if (actor.id === trimmedId && role !== UserRole.Admin) {
      throw new ForbiddenException(
        'Vous ne pouvez pas rétrograder votre propre compte administrateur',
      );
    }

    const updated = await this.userRepo.updateRole(trimmedId, role);
    if (!updated) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return {
      id: updated.id,
      pseudo: updated.pseudo,
      role: updated.role,
      createdAt: updated.createdAt.toISOString(),
    };
  }
}
