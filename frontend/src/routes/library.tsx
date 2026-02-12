import type { ReactElement } from 'react';
import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { bouchonRecipes } from '@/features/library/bouchonLibrary';
import { RecipeCard } from '@/features/library/RecipeCard';
import { RecipeSearchBar, useRecipeSearch } from '@/features/library/RecipeSearchBar';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bibliotheque',
  component: LibraryPage,
});

function LibraryPage(): ReactElement {
  const { query, setQuery, filteredRecipes } = useRecipeSearch(bouchonRecipes);

  return (
    <div className="mx-auto max-w-[1400px] px-4">
      <RecipeSearchBar value={query} onChange={setQuery} />
      <div className="mt-6 flex flex-wrap justify-start gap-6">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
