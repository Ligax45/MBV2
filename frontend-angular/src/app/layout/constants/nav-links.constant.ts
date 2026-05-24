import type { NavLink } from '@layout/models/nav-link.model';

export const NAV_LINKS: readonly NavLink[] = [
  { path: '/', label: 'Accueil', icon: 'pi pi-home' },
  { path: '/bibliotheque', label: 'Bibliothèque', icon: 'pi pi-book' },
  { path: '/createRecipe', label: 'Créer une recette', icon: 'pi pi-plus-circle' },
] as const;
