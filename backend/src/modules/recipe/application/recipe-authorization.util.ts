import type { AuthenticatedUser } from '../../auth/domain/auth-user.model';
import { hasRecipeModerationRole } from '../../auth/domain/user-role.enum';
import type { Recipe } from '../domain/entities/recipe.entity';

export function canModerateRecipes(actor: AuthenticatedUser): boolean {
  return hasRecipeModerationRole(actor.role);
}

export function canModifyRecipe(
  actor: AuthenticatedUser,
  authorUserId: string | null,
): boolean {
  if (canModerateRecipes(actor)) {
    return true;
  }

  return !!authorUserId && authorUserId === actor.id;
}

export function isPubliclyListed(
  recipe: Pick<Recipe, 'visibility' | 'moderationStatus'>,
): boolean {
  return (
    recipe.visibility === 'public' && recipe.moderationStatus === 'approved'
  );
}

export function canViewRecipe(
  actor: AuthenticatedUser | undefined,
  recipe: Pick<Recipe, 'visibility' | 'moderationStatus' | 'authorUserId'>,
): boolean {
  if (isPubliclyListed(recipe)) {
    return true;
  }
  if (!actor) {
    return false;
  }
  if (canModerateRecipes(actor)) {
    return true;
  }
  return !!recipe.authorUserId && recipe.authorUserId === actor.id;
}
