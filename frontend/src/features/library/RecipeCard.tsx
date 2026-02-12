import { useState } from 'react';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Heart, Timer } from 'lucide-react';
import type { Recipe } from './bouchonLibrary';
import { cn } from '@/lib/utils';
import { LikeBurstEffect, useLikeAnimation } from './likeBurstAnimation';

const difficultyStyles: Record<Recipe['difficulty'], { label: string; className: string }> = {
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

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatPreparationTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

type RecipeCardProps = {
  recipe: Recipe;
  className?: string;
};

export function RecipeCard({ recipe, className }: Readonly<RecipeCardProps>) {
  const [isLiked, setIsLiked] = useState(false);
  const { burstKey, isPressing, triggerLikeAnimation } = useLikeAnimation();
  const difficulty = difficultyStyles[recipe.difficulty];

  function handleLikeClick() {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    if (newLiked) triggerLikeAnimation();
  }

  return (
    <Card
      className={cn(
        'flex w-80 max-w-full shrink-0 flex-col gap-2 overflow-hidden p-0 transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="relative aspect-video w-full overflow-visible bg-muted">
        <div className="absolute inset-0 overflow-hidden">
          <img src={recipe.imageUrl} alt={recipe.title} className="h-full w-full object-cover" />
        </div>
        <div className="absolute right-2 top-2 flex size-9 items-center justify-center">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="relative z-10 size-9 rounded-full bg-white/30 shadow-sm backdrop-blur-sm hover:bg-white/50 dark:bg-black/30 dark:hover:bg-black/50"
            aria-label={isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            onClick={handleLikeClick}
          >
            <span
              className={cn('inline-flex origin-center', isPressing && 'animate-[heart-press_0.4s_ease-out_forwards]')}
            >
              <Heart className={cn('size-5 transition-colors', isLiked && 'fill-red-500 text-red-500')} />
            </span>
          </Button>
          <LikeBurstEffect burstKey={burstKey} />
        </div>
      </div>
      <CardHeader className="gap-2 px-5 pb-2 pt-4">
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight">{recipe.title}</h3>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{recipe.description}</p>
        <div className="flex flex-col gap-1 pt-1 text-sm text-muted-foreground">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Timer className="size-4 shrink-0" />
              {formatPreparationTime(recipe.preparationTimeMinutes)}
            </span>
            <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', difficulty.className)}>
              {difficulty.label}
            </span>
          </div>
          <span>
            Publié le <time dateTime={recipe.createdAt}>{formatDate(recipe.createdAt)}</time>
          </span>
        </div>
      </CardHeader>
      <CardFooter className="px-5 pb-4 pt-2 text-sm text-muted-foreground">Par {recipe.creatorName}</CardFooter>
    </Card>
  );
}
