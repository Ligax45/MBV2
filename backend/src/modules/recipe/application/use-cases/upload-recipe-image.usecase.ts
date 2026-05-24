import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseStorageService } from '../../../../core/storage/supabase-storage.service';
import { RECIPE_REPOSITORY } from '../../domain/repositories/recipe.repository';
import type { RecipeRepository } from '../../domain/repositories/recipe.repository';

const PG_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export interface UploadedRecipeImageResult {
  imageUrl: string;
}

@Injectable()
export class UploadRecipeImageUseCase {
  constructor(
    private readonly storage: SupabaseStorageService,
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
  ) {}

  async execute(
    recipeId: string,
    file: Express.Multer.File,
  ): Promise<UploadedRecipeImageResult> {
    const id = recipeId?.trim() ?? '';
    if (!id) throw new BadRequestException('id is required');
    if (!PG_UUID_RE.test(id))
      throw new BadRequestException('id doit être un UUID valide');

    if (!file?.buffer?.length) {
      throw new BadRequestException('Fichier image requis (champ "file").');
    }

    const mime = file.mimetype?.toLowerCase() ?? '';
    if (!ALLOWED_MIME.has(mime)) {
      throw new BadRequestException(
        'Format non supporté. Utilisez JPEG, PNG, WebP ou GIF.',
      );
    }

    const existing = await this.recipeRepo.findById(id);
    if (!existing) throw new NotFoundException('Recette introuvable');

    const extension =
      MIME_TO_EXT[mime] ??
      file.originalname?.split('.').pop()?.toLowerCase() ??
      'jpg';

    const imageUrl = await this.storage.uploadRecipeCover(
      id,
      file.buffer,
      mime,
      extension,
    );

    const updated = await this.recipeRepo.updateImageUrl(id, imageUrl);
    if (!updated) throw new NotFoundException('Recette introuvable');

    return { imageUrl };
  }
}
