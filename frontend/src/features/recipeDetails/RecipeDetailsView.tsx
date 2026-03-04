import type { ReactElement } from 'react';
import { Clock, User, UtensilsCrossed } from 'lucide-react';
import type { RecipeDetails } from './types';
import { bouchonRecipeTypes } from '@/features/createRecipe/bouchonRecipeTypes';
import { bouchonEquipment } from '@/features/createRecipe/bouchonEquipment';
import { cn } from '@/lib/utils';

const difficultyStyles: Record<RecipeDetails['difficulty'], { label: string; className: string }> = {
  facile: {
    label: 'Facile',
    className: 'bg-green-500/15 text-green-700 dark:text-green-400',
  },
  moyen: {
    label: 'Moyen',
    className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  },
  difficile: {
    label: 'Difficile',
    className: 'bg-red-500/15 text-red-700 dark:text-red-400',
  },
};

const formatDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
};

const totalTimeMinutes = (recipe: RecipeDetails): number =>
  recipe.time.preparationMinutes + recipe.time.cookingMinutes + recipe.time.restMinutes;

const getRecipeTypeLabel = (id: RecipeDetails['recipeType']): string =>
  bouchonRecipeTypes.find((t) => t.id === id)?.label ?? id;

const getEquipmentLabels = (ids: RecipeDetails['equipment']): string[] =>
  ids.map((id) => bouchonEquipment.find((e) => e.id === id)?.label ?? id);

const formatIngredientLine = (ing: RecipeDetails['ingredients'][0]): string => {
  const qty = ing.quantity ? `${ing.quantity} ` : '';
  const unit = ing.unit ? `${ing.unit} ` : '';
  return `${qty}${unit}${ing.name}`.trim();
};

type RecipeDetailsViewProps = {
  recipe: RecipeDetails;
};

export const RecipeDetailsView = ({ recipe }: Readonly<RecipeDetailsViewProps>): ReactElement => {
  const difficulty = difficultyStyles[recipe.difficulty];
  const equipmentLabels = getEquipmentLabels(recipe.equipment);
  const totalTime = totalTimeMinutes(recipe);

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="relative aspect-video w-full bg-muted">
          <img src={recipe.imageUrl} alt={recipe.title} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-4 p-6 md:p-8">
          <header className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{recipe.title}</h1>
            <p className="text-muted-foreground leading-relaxed">{recipe.description}</p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                {formatMinutes(totalTime)}
              </span>
              <span className={cn('rounded-full px-3 py-1 text-sm font-medium', difficulty.className)}>
                {difficulty.label}
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="size-4 shrink-0" />
                {recipe.creatorName}
              </span>
              <time dateTime={recipe.createdAt} className="text-sm text-muted-foreground">
                Publié le {formatDate(recipe.createdAt)}
              </time>
            </div>
          </header>

          <div className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</h3>
              <p className="mt-1 font-medium">{getRecipeTypeLabel(recipe.recipeType)}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Portions</h3>
              <p className="mt-1 font-medium">{recipe.servings} personne(s)</p>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="size-4" />
              Temps de réalisation
            </h3>
            <ul className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <li>Préparation : {formatMinutes(recipe.time.preparationMinutes)}</li>
              <li>Cuisson : {formatMinutes(recipe.time.cookingMinutes)}</li>
              <li>Repos : {formatMinutes(recipe.time.restMinutes)}</li>
            </ul>
          </div>

          {equipmentLabels.length > 0 && (
            <div className="border-t border-border pt-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <UtensilsCrossed className="size-4" />
                Équipement
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {equipmentLabels.map((label) => (
                  <li key={label} className="rounded-md bg-muted px-3 py-1.5 text-sm">
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {recipe.ingredients.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold">Ingrédients</h2>
          <ul className="mt-4 space-y-2">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id} className="flex text-muted-foreground">
                <span className="mr-2 text-foreground">•</span>
                {formatIngredientLine(ing)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recipe.steps.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold">Étapes de réalisation</h2>
          <ol className="mt-4 list-none space-y-6">
            {[...recipe.steps]
              .sort((a, b) => a.order - b.order)
              .map((step) => (
                <li key={step.id} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {step.order}
                  </span>
                  <p className="flex-1 pt-0.5 text-muted-foreground">{step.content}</p>
                </li>
              ))}
          </ol>
        </div>
      )}
    </article>
  );
};
