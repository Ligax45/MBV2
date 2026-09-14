import { Routes } from '@angular/router';

import { authRoutes } from '@features/auth/auth.routes';
import { recipeCookingModeRoutes } from '@features/recipe-cooking-mode/recipe-cooking-mode.routes';
import { layoutRoutes } from '@layout/layout.routes';

export const routes: Routes = [
  ...authRoutes,
  ...recipeCookingModeRoutes,
  ...layoutRoutes,
];
