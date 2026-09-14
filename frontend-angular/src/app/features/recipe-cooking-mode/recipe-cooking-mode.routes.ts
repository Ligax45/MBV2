import { Routes } from '@angular/router';

export const recipeCookingModeRoutes: Routes = [
  {
    path: 'recette/:recipeId/cuisiner',
    loadComponent: () =>
      import('./recipe-cooking-mode.component').then((m) => m.RecipeCookingModeComponent),
  },
];
