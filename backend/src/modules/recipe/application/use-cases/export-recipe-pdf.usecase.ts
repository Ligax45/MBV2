import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/auth-user.model';
import { canViewRecipe } from '../recipe-authorization.util';
import { buildRecipePdfDocument } from '../recipe-pdf-document.builder';
import { buildRecipePdfFilename } from '../recipe-pdf-filename.util';
import { renderPdfToBuffer } from '../recipe-pdf.renderer';
import { RECIPE_REPOSITORY } from '../../domain/repositories/recipe.repository';
import type { RecipeRepository } from '../../domain/repositories/recipe.repository';

const PG_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ExportRecipePdfResult {
  buffer: Buffer;
  filename: string;
  contentType: 'application/pdf';
}

@Injectable()
export class ExportRecipePdfUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
  ) {}

  async execute(
    id: string,
    actor?: AuthenticatedUser,
  ): Promise<ExportRecipePdfResult> {
    const trimmed = id?.trim() ?? '';
    if (!trimmed) throw new BadRequestException('id is required');
    if (!PG_UUID_RE.test(trimmed)) {
      throw new BadRequestException('id doit être un UUID valide');
    }

    const recipe = await this.recipeRepo.findById(trimmed);
    if (!recipe || !canViewRecipe(actor, recipe)) {
      throw new NotFoundException('Recette introuvable');
    }

    const docDefinition = buildRecipePdfDocument(recipe);
    const buffer = await renderPdfToBuffer(docDefinition);

    return {
      buffer,
      filename: buildRecipePdfFilename(recipe.title),
      contentType: 'application/pdf',
    };
  }
}
