import { join, resolve, sep } from 'node:path';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const RECIPE_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp', 'gif'] as const;

export type RecipeImageExtension = (typeof RECIPE_IMAGE_EXTENSIONS)[number];

export function recipeImagesRoot(): string {
  const configured = process.env.RECIPE_IMAGES_DIR?.trim();
  return resolve(configured || join(process.cwd(), 'data', 'recipe-images'));
}

export function isRecipeImageExtension(
  value: string,
): value is RecipeImageExtension {
  return (RECIPE_IMAGE_EXTENSIONS as readonly string[]).includes(value);
}

/** Chemin public servi par le proxy `/api` (dev Angular et nginx). */
export function recipeCoverPublicPath(
  recipeId: string,
  extension: RecipeImageExtension,
): string {
  return `/api/media/recipes/${recipeId}/cover.${extension}`;
}

/**
 * Fichier absolu de la couverture, ou `null` si l'id ou l'extension est invalide.
 * Le résultat reste sous le répertoire des images.
 */
export function resolveRecipeCoverFile(
  recipeId: string,
  extension: string,
): string | null {
  const normalizedExt = extension.replace(/^\./, '').toLowerCase();
  if (!UUID_RE.test(recipeId) || !isRecipeImageExtension(normalizedExt)) {
    return null;
  }

  const root = recipeImagesRoot();
  const file = resolve(root, 'recipes', recipeId, `cover.${normalizedExt}`);
  if (file !== root && !file.startsWith(root + sep)) {
    return null;
  }
  return file;
}

export function recipeCoverDirectory(recipeId: string): string | null {
  if (!UUID_RE.test(recipeId)) return null;
  const root = recipeImagesRoot();
  const directory = resolve(root, 'recipes', recipeId);
  if (directory !== root && !directory.startsWith(root + sep)) {
    return null;
  }
  return directory;
}
