import { Routes } from '@angular/router';

export const libraryRoutes: Routes = [
  {
    path: 'bibliotheque',
    loadComponent: () =>
      import('./library.component').then((m) => m.LibraryComponent),
  },
  {
    path: 'bibliotheque/favoris',
    loadComponent: () =>
      import('./library.component').then((m) => m.LibraryComponent),
    data: { favoritesOnly: true },
  },
  {
    path: 'bibliotheque/mes-recettes',
    loadComponent: () =>
      import('./library.component').then((m) => m.LibraryComponent),
    data: { mineOnly: true },
  },
];
