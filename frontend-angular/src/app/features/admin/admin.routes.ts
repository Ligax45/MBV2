import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: 'admin/utilisateurs',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./admin-users.component').then((m) => m.AdminUsersComponent),
  },
];
