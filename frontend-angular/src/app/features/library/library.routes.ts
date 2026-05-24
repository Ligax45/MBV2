import { Routes } from '@angular/router';

export const libraryRoutes: Routes = [
  {
    path: 'bibliotheque',
    loadComponent: () =>
      import('./library.component').then((m) => m.LibraryComponent),
  },
];
