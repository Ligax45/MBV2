import type { ReactElement } from 'react';
import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { bouchonRecipes } from '@/features/library/bouchonLibrary';
import { RecipeCard } from '@/features/library/RecipeCard';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bibliotheque',
  component: LibraryPage,
});

function LibraryPage(): ReactElement {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Bibliothèque</h1>
      <p className="mt-2 text-muted-foreground">Vos recettes enregistrées.</p>
      <div className="mt-6 flex flex-wrap gap-4">
        {bouchonRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
