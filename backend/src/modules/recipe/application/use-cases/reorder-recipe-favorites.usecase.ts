import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/auth-user.model';
import { RECIPE_FAVORITE_REPOSITORY } from '../../domain/repositories/recipe-favorite.repository';
import type { RecipeFavoriteRepository } from '../../domain/repositories/recipe-favorite.repository';

const PG_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class ReorderRecipeFavoritesUseCase {
  constructor(
    @Inject(RECIPE_FAVORITE_REPOSITORY)
    private readonly favoriteRepo: RecipeFavoriteRepository,
  ) {}

  async execute(recipeIds: string[], user: AuthenticatedUser) {
    if (!Array.isArray(recipeIds)) {
      throw new BadRequestException('recipeIds doit être un tableau');
    }

    const normalized = recipeIds.map((id) => id?.trim() ?? '');
    if (normalized.some((id) => !id || !PG_UUID_RE.test(id))) {
      throw new BadRequestException(
        'Chaque identifiant de recette doit être un UUID valide',
      );
    }

    const uniqueIds = new Set(normalized);
    if (uniqueIds.size !== normalized.length) {
      throw new BadRequestException(
        'La liste ne doit pas contenir de doublons',
      );
    }

    await this.favoriteRepo.reorderFavorites(user.id, normalized);
    return { success: true };
  }
}
