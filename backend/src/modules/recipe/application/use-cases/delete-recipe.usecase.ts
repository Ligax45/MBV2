import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/auth-user.model';
import { canModifyRecipe } from '../recipe-authorization.util';
import {
  RECIPE_REPOSITORY,
  type RecipeRepository,
} from '../../domain/repositories/recipe.repository';

const PG_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertUuid(field: string, value: string): void {
  if (!PG_UUID_RE.test(value.trim())) {
    throw new BadRequestException(
      `${field} doit être un UUID valide (ex. id d’une ligne existante dans la table concernée)`,
    );
  }
}

@Injectable()
export class DeleteRecipeUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
  ) {}

  async execute(id: string, actor: AuthenticatedUser) {
    const trimmedId = id?.trim() ?? '';
    if (!trimmedId) throw new BadRequestException('id is required');
    assertUuid('id', trimmedId);

    const recipe = await this.recipeRepo.findById(trimmedId);
    if (!recipe) throw new NotFoundException('Recette introuvable');

    if (!canModifyRecipe(actor, recipe.authorUserId ?? null)) {
      throw new ForbiddenException('Seul l’auteur peut supprimer cette recette');
    }

    const deleted = await this.recipeRepo.delete(trimmedId);
    if (!deleted) throw new NotFoundException('Recette introuvable');

    return { success: true };
  }
}
