import type { AuthenticatedUser } from '../../auth/domain/auth-user.model';
import { UserRole } from '../../auth/domain/user-role.enum';

export function canModifyRecipe(
  actor: AuthenticatedUser,
  authorUserId: string | null,
): boolean {
  if (actor.role === UserRole.Admin || actor.role === UserRole.Moderator) {
    return true;
  }

  return !!authorUserId && authorUserId === actor.id;
}
