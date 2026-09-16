/** Commentaire public laissé par un utilisateur ayant réalisé la recette. */
export interface RecipeComment {
  userId: string;
  authorName: string;
  comment: string;
  updatedAt: string;
}
