import type { RecipeDifficulty, RecipeModerationStatus, RecipeVisibility } from './recipe-api.model';

/** Modèle d'affichage pour une carte recette (bibliothèque). */
export interface RecipeListItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  totalTimeMinutes: number;
  createdAt: string;
  difficulty: RecipeDifficulty;
  creatorName: string;
  recipeTypeId: string;
  recipeTypeLabel: string;
  averageRating?: number | null;
  isFavorited?: boolean;
  visibility: RecipeVisibility;
  moderationStatus: RecipeModerationStatus;
  moderationComment?: string | null;
}
