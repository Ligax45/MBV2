import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/auth-user.model';
import { toRecipeResponse } from '../recipe-response.util';
import { RECIPE_REPOSITORY } from '../../domain/repositories/recipe.repository';
import type { RecipeRepository } from '../../domain/repositories/recipe.repository';

const PG_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class RejectRecipeUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
    comment?: string,
  ) {
    const trimmed = id?.trim() ?? '';
    if (!trimmed) throw new BadRequestException('id is required');
    if (!PG_UUID_RE.test(trimmed))
      throw new BadRequestException('id doit être un UUID valide');

    const existing = await this.recipeRepo.findById(trimmed);
    if (!existing) throw new NotFoundException('Recette introuvable');

    if (existing.visibility !== 'public' || existing.moderationStatus !== 'pending') {
      throw new BadRequestException(
        'Cette recette n’est pas en attente de validation',
      );
    }

    const moderationComment = comment?.trim() || null;

    const recipe = await this.recipeRepo.updateModeration(trimmed, {
      moderationStatus: 'rejected',
      moderationComment,
      reviewedAt: new Date(),
      reviewedByUserId: actor.id,
    });
    if (!recipe) throw new NotFoundException('Recette introuvable');

    return toRecipeResponse(recipe);
  }
}
