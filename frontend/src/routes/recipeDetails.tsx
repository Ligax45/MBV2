import type { ReactElement } from 'react';
import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { RecipeDetailsView, bouchonRecipeDetailsTarteAuxPommes } from '@/features/recipeDetails';
import type { RecipeDetails } from '@/features/recipeDetails';
import { bouchonRecipes } from '@/features/library/bouchonLibrary';

function toMinimalRecipeDetails(recipe: (typeof bouchonRecipes)[0]): RecipeDetails {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    createdAt: recipe.createdAt,
    difficulty: recipe.difficulty,
    creatorName: recipe.creatorName,
    servings: 2,
    recipeType: 'autres',
    equipment: [],
    time: {
      preparationMinutes: recipe.preparationTimeMinutes,
      cookingMinutes: 0,
      restMinutes: 0,
    },
    ingredients: [],
    steps: [],
  };
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recette/$recipeId',
  loader: ({ params }) => {
    if (params.recipeId === '1') {
      return { recipe: bouchonRecipeDetailsTarteAuxPommes };
    }
    const fromList = bouchonRecipes.find((r) => r.id === params.recipeId);
    const recipe = fromList ? toMinimalRecipeDetails(fromList) : null;
    return { recipe };
  },
  component: RecipeDetailsPage,
});

function RecipeDetailsPage(): ReactElement {
  const { recipe } = Route.useLoaderData();

  if (!recipe) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h2 className="text-xl font-semibold text-muted-foreground">
          Recette introuvable
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette recette n&apos;existe pas ou a été supprimée.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <RecipeDetailsView recipe={recipe} />
    </div>
  );
}
