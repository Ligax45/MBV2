import type { ReactElement } from 'react';
import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bibliotheque',
  component: BibliothequePage,
});

function BibliothequePage(): ReactElement {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Bibliothèque</h1>
      <p className="mt-2 text-muted-foreground">Contenu de la bibliothèque.</p>
    </div>
  );
}
