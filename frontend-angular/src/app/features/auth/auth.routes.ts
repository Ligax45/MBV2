import { Routes } from '@angular/router';

import { guestGuard } from '@core/guards/guest.guard';

export const authRoutes: Routes = [
  {
    path: 'connexion',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./auth.component').then((m) => m.AuthComponent),
  },
];
