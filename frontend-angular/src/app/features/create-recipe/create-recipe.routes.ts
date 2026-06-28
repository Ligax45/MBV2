import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';

export const createRecipeRoutes: Routes = [
  {
    path: 'createRecipe',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./create-recipe.component').then((m) => m.CreateRecipeComponent),
  },
  {
    path: 'recette/:recipeId/modifier',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./create-recipe.component').then((m) => m.CreateRecipeComponent),
  },
];
