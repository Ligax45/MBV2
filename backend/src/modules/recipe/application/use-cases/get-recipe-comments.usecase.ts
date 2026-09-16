import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/auth-user.model';
import { canViewRecipe } from '../recipe-authorization.util';
import { RECIPE_COMPLETION_REPOSITORY } from '../../domain/repositories/recipe-completion.repository';
import type { RecipeCompletionRepository } from '../../domain/repositories/recipe-completion.repository';
import { RECIPE_REPOSITORY } from '../../domain/repositories/recipe.repository';
import type { RecipeRepository } from '../../domain/repositories/recipe.repository';

const PG_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class GetRecipeCommentsUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
    @Inject(RECIPE_COMPLETION_REPOSITORY)
    private readonly completionRepo: RecipeCompletionRepository,
  ) {}

  async execute(recipeId: string, actor?: AuthenticatedUser) {
    const trimmed = recipeId?.trim() ?? '';
    if (!trimmed) throw new BadRequestException('id is required');
    if (!PG_UUID_RE.test(trimmed))
      throw new BadRequestException('id doit être un UUID valide');

    const recipe = await this.recipeRepo.findById(trimmed);
    if (!recipe || !canViewRecipe(actor, recipe)) {
      throw new NotFoundException('Recette introuvable');
    }

    const comments = await this.completionRepo.listPublicComments(trimmed);

    return { comments };
  }
}
