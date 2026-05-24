import { Routes } from '@angular/router';

export const recipeDetailsRoutes: Routes = [
  {
    path: 'recette/:recipeId',
    loadComponent: () =>
      import('./recipe-details.component').then((m) => m.RecipeDetailsComponent),
  },
];
