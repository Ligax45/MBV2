import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/auth-user.model';
import { parseRecipeCommentInput } from '../recipe-comment.util';
import { isPubliclyListed } from '../recipe-authorization.util';
import { RECIPE_COMPLETION_REPOSITORY } from '../../domain/repositories/recipe-completion.repository';
import type { RecipeCompletionRepository } from '../../domain/repositories/recipe-completion.repository';
import { RECIPE_REPOSITORY } from '../../domain/repositories/recipe.repository';
import type { RecipeRepository } from '../../domain/repositories/recipe.repository';

const PG_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class SetRecipeCommentUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
    @Inject(RECIPE_COMPLETION_REPOSITORY)
    private readonly completionRepo: RecipeCompletionRepository,
  ) {}

  async execute(
    recipeId: string,
    user: AuthenticatedUser,
    commentInput: unknown,
  ) {
    const trimmed = recipeId?.trim() ?? '';
    if (!trimmed) throw new BadRequestException('id is required');
    if (!PG_UUID_RE.test(trimmed))
      throw new BadRequestException('id doit être un UUID valide');

    const recipe = await this.recipeRepo.findById(trimmed);
    if (!recipe || !isPubliclyListed(recipe)) {
      throw new NotFoundException('Recette introuvable');
    }

    const hasCompleted = await this.completionRepo.hasCompleted(user.id, trimmed);
    if (!hasCompleted) {
      throw new ForbiddenException(
        'Vous devez d’abord marquer la recette comme réalisée avant de commenter',
      );
    }

    const comment = parseRecipeCommentInput(commentInput);
    await this.completionRepo.setUserComment(user.id, trimmed, comment);

    return {
      success: true,
      userComment: comment,
    };
  }
}
