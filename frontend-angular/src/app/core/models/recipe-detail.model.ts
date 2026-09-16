import type {
  RecipeDifficulty,
  RecipeModerationStatus,
  RecipeVisibility,
} from './recipe-api.model';
import type { RecipeIngredient } from './recipe-ingredient.model';
import type { RecipeStep } from './recipe-step.model';

/** Modèle d'affichage pour la page détail recette. */
export interface RecipeDetail {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  difficulty: RecipeDifficulty;
  creatorName: string;
  authorUserId: string | null;
  servings: number;
  recipeTypeLabel: string;
  prepMinutes: number;
  cookMinutes: number;
  restMinutes: number;
  equipmentLabels: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  isFavorited?: boolean;
  hasCompleted?: boolean;
  userRating?: number | null;
  userComment?: string | null;
  averageRating?: number | null;
  ratingCount?: number;
  favoriteCount?: number;
  visibility: RecipeVisibility;
  moderationStatus: RecipeModerationStatus;
  moderationComment: string | null;
}
