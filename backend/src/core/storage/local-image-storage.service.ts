import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import {
  RECIPE_IMAGE_EXTENSIONS,
  isRecipeImageExtension,
  recipeCoverDirectory,
  recipeCoverPublicPath,
} from './recipe-image-path';

@Injectable()
export class LocalImageStorageService {
  async uploadRecipeCover(
    recipeId: string,
    file: Buffer,
    extension: string,
  ): Promise<string> {
    const safeExt = extension.replace(/^\./, '').toLowerCase();
    if (!isRecipeImageExtension(safeExt)) {
      throw new Error('Extension d’image non supportée');
    }
    const directory = recipeCoverDirectory(recipeId);
    if (!directory) {
      throw new Error('Identifiant de recette invalide');
    }

    await mkdir(directory, { recursive: true });
    await Promise.all(
      RECIPE_IMAGE_EXTENSIONS.filter((ext) => ext !== safeExt).map((ext) =>
        rm(join(directory, `cover.${ext}`), { force: true }),
      ),
    );
    await writeFile(join(directory, `cover.${safeExt}`), file);
    return recipeCoverPublicPath(recipeId, safeExt);
  }
}
