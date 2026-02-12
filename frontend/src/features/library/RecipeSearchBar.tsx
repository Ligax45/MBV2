import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Recipe } from './bouchonLibrary';

/** Normalise une chaîne pour la recherche : minuscules + sans accents */
function normalizeForSearch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '');
}

export function useRecipeSearch(recipes: Recipe[]) {
  const [query, setQuery] = useState('');

  const filteredRecipes = useMemo(() => {
    const q = normalizeForSearch(query.trim());
    if (!q) return recipes;
    return recipes.filter((r) => normalizeForSearch(r.title).includes(q));
  }, [recipes, query]);

  return { query, setQuery, filteredRecipes };
}

type RecipeSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function RecipeSearchBar({
  value,
  onChange,
  placeholder = 'Rechercher une recette par titre…',
}: Readonly<RecipeSearchBarProps>) {
  return (
    <div className="relative max-w-md">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="text"
        role="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
        aria-label="Rechercher une recette par titre"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          aria-label="Effacer la recherche"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
