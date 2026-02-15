import { createRouter } from '@tanstack/react-router';
import { Route as rootRoute } from './routes/__root';
import { Route as indexRoute } from './routes/index';
import { Route as bibliothequeRoute } from './routes/library';
import { Route as createRecipeRoute } from './routes/createRecipe';

const routeTree = rootRoute.addChildren([indexRoute, bibliothequeRoute, createRecipeRoute]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
