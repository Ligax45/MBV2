import { Routes } from '@angular/router';

import { createRecipeRoutes } from '@features/create-recipe/create-recipe.routes';
import { homeRoutes } from '@features/home/home.routes';
import { libraryRoutes } from '@features/library/library.routes';
import { recipeDetailsRoutes } from '@features/recipe-details/recipe-details.routes';

import { LayoutComponent } from './layout.component';

export const layoutRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      ...homeRoutes,
      ...libraryRoutes,
      ...recipeDetailsRoutes,
      ...createRecipeRoutes,
    ],
  },
];
