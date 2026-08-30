import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';

export const moderationRoutes: Routes = [
  {
    path: 'moderation',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'moderator'] },
    loadComponent: () =>
      import('./moderation.component').then((m) => m.ModerationComponent),
  },
];
