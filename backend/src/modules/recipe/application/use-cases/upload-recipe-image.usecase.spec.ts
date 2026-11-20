import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '../../../auth/domain/user-role.enum';
import type { AuthenticatedUser } from '../../../auth/domain/auth-user.model';
import { Recipe } from '../../domain/entities/recipe.entity';
import type { RecipeRepository } from '../../domain/repositories/recipe.repository';
import type { SupabaseStorageService } from '../../../../core/storage/supabase-storage.service';
import { UploadRecipeImageUseCase } from './upload-recipe-image.usecase';

function makeRecipe(authorUserId: string): Recipe {
  return new Recipe(
    '11111111-1111-1111-1111-111111111111',
    'Tarte',
    'Desc',
    'facile',
    4,
    { id: '22222222-2222-2222-2222-222222222222', label: 'Dessert' },
    null,
    authorUserId,
    'owner',
    10,
    20,
    0,
    new Date(),
    new Date(),
    [],
    [],
    [],
    'private',
    'approved',
    null,
    null,
    null,
  );
}

describe('UploadRecipeImageUseCase', () => {
  const recipeId = '11111111-1111-1111-1111-111111111111';
  const owner: AuthenticatedUser = {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    pseudo: 'owner',
    role: UserRole.User,
  };
  const stranger: AuthenticatedUser = {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    pseudo: 'stranger',
    role: UserRole.User,
  };
  const file = {
    buffer: Buffer.from('fake-image'),
    mimetype: 'image/jpeg',
    originalname: 'cover.jpg',
  } as Express.Multer.File;

  let recipeRepo: jest.Mocked<Pick<RecipeRepository, 'findById' | 'updateImageUrl'>>;
  let storage: jest.Mocked<Pick<SupabaseStorageService, 'uploadRecipeCover'>>;
  let useCase: UploadRecipeImageUseCase;

  beforeEach(() => {
    recipeRepo = {
      findById: jest.fn(),
      updateImageUrl: jest.fn(),
    };
    storage = {
      uploadRecipeCover: jest.fn().mockResolvedValue('https://cdn.example/cover.jpg'),
    };
    useCase = new UploadRecipeImageUseCase(
      storage as unknown as SupabaseStorageService,
      recipeRepo as unknown as RecipeRepository,
    );
  });

  it('rejette un utilisateur non auteur (pas de droits de modification)', async () => {
    recipeRepo.findById.mockResolvedValue(makeRecipe(owner.id));

    await expect(useCase.execute(recipeId, file, stranger)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(storage.uploadRecipeCover).not.toHaveBeenCalled();
  });

  it('autorise l’auteur à uploader', async () => {
    const recipe = makeRecipe(owner.id);
    recipeRepo.findById.mockResolvedValue(recipe);
    recipeRepo.updateImageUrl.mockResolvedValue(recipe);

    const result = await useCase.execute(recipeId, file, owner);

    expect(result.imageUrl).toBe('https://cdn.example/cover.jpg');
    expect(storage.uploadRecipeCover).toHaveBeenCalled();
  });

  it('renvoie 404 si la recette n’existe pas', async () => {
    recipeRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(recipeId, file, owner)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
