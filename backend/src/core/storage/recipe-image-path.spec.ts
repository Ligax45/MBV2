import { join, sep } from 'node:path';
import {
  recipeCoverPublicPath,
  recipeImagesRoot,
  resolveRecipeCoverFile,
} from './recipe-image-path';

const RECIPE_ID = '11111111-1111-4111-8111-111111111111';

describe('recipe-image-path', () => {
  const previous = process.env.RECIPE_IMAGES_DIR;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.RECIPE_IMAGES_DIR;
    } else {
      process.env.RECIPE_IMAGES_DIR = previous;
    }
  });

  it('expose une URL relative servie par le proxy /api', () => {
    expect(recipeCoverPublicPath(RECIPE_ID, 'jpg')).toBe(
      `/api/media/recipes/${RECIPE_ID}/cover.jpg`,
    );
  });

  it('refuse un identifiant ou une extension invalide', () => {
    process.env.RECIPE_IMAGES_DIR = '/data/recipe-images';
    expect(resolveRecipeCoverFile('../etc', 'jpg')).toBeNull();
    expect(resolveRecipeCoverFile(RECIPE_ID, 'exe')).toBeNull();
    expect(resolveRecipeCoverFile(RECIPE_ID, '../../passwd')).toBeNull();
  });

  it('résout la couverture sous le répertoire configuré', () => {
    process.env.RECIPE_IMAGES_DIR = '/data/recipe-images';
    expect(resolveRecipeCoverFile(RECIPE_ID, 'png')).toBe(
      join(recipeImagesRoot(), 'recipes', RECIPE_ID, 'cover.png'),
    );
    expect(resolveRecipeCoverFile(RECIPE_ID, '.WEBP')).toBe(
      `${recipeImagesRoot()}${sep}recipes${sep}${RECIPE_ID}${sep}cover.webp`,
    );
  });
});
