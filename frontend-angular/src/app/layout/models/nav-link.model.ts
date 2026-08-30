export interface NavLink {
  path: string;
  label: string;
  /** Classes PrimeIcons, ex. `pi pi-home` — voir https://primeng.org/icons */
  icon: string;
  /** Si vrai, le lien n'est affiché que pour un utilisateur connecté. */
  requiresAuth?: boolean;
  /** Bouton d'action mis en avant (ex. créer une recette). */
  variant?: 'cta';
}
