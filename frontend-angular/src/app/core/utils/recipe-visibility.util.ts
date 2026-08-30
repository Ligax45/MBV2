import type {
  RecipeModerationStatus,
  RecipeVisibility,
} from '@core/models/recipe-api.model';

export function isPubliclyListed(recipe: {
  visibility: RecipeVisibility;
  moderationStatus: RecipeModerationStatus;
}): boolean {
  return recipe.visibility === 'public' && recipe.moderationStatus === 'approved';
}
