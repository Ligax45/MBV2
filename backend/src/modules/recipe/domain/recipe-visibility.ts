export type RecipeVisibility = 'public' | 'private';

export type RecipeModerationStatus = 'pending' | 'approved' | 'rejected';

export const RECIPE_VISIBILITIES: readonly RecipeVisibility[] = [
  'public',
  'private',
];

export const RECIPE_MODERATION_STATUSES: readonly RecipeModerationStatus[] = [
  'pending',
  'approved',
  'rejected',
];
