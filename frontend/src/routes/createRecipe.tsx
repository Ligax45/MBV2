import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import type { ReactElement } from 'react';
import { CreateRecipeForm } from '@/features/createRecipe/CreateRecipeForm';

const CreateRecipePage = (): ReactElement => (
  <div className="mx-auto max-w-3xl px-4 py-8">
    <h1 className="mb-6 text-2xl font-bold">Créer une recette</h1>
    <CreateRecipeForm />
  </div>
);

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/createRecipe',
  component: CreateRecipePage,
});
