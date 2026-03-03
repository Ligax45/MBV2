import type { ReactElement } from 'react';
import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';

const HomePage = (): ReactElement => (
  <div>
      <h1 className="text-2xl font-semibold">Accueil</h1>
      <p className="mt-2 text-muted-foreground">
        Bienvenue sur la page d&apos;accueil.
      </p>
  </div>
);

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});
