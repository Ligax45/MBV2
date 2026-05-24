import type { RecipeDifficulty } from './recipe-api.model';

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
}
