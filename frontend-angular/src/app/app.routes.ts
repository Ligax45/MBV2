import { Routes } from '@angular/router';

import { authRoutes } from '@features/auth/auth.routes';
import { layoutRoutes } from '@layout/layout.routes';

export const routes: Routes = [...authRoutes, ...layoutRoutes];
