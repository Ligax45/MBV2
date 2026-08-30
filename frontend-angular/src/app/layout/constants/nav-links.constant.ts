import type { NavLink } from '@layout/models/nav-link.model';

export const NAV_LINKS: readonly NavLink[] = [
  {
    path: '/createRecipe',
    label: 'Créer une recette',
    icon: 'pi pi-plus',
    requiresAuth: true,
    variant: 'cta',
  },
  { path: '/', label: 'Accueil', icon: 'pi pi-home' },
  { path: '/bibliotheque', label: 'Bibliothèque', icon: 'pi pi-book' },
  { path: '/bibliotheque/mes-recettes', label: 'Mes recettes', icon: 'pi pi-folder', requiresAuth: true },
] as const;
