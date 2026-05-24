import { Routes } from '@angular/router';

export const createRecipeRoutes: Routes = [
  {
    path: 'createRecipe',
    loadComponent: () =>
      import('./create-recipe.component').then((m) => m.CreateRecipeComponent),
  },
  {
    path: 'recette/:recipeId/modifier',
    loadComponent: () =>
      import('./create-recipe.component').then((m) => m.CreateRecipeComponent),
  },
];
