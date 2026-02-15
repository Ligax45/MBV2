import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import type { RecipeIngredient } from '../types';
import { cn } from '@/lib/utils';

type RecipeIngredientsFieldProps = {
  ingredients: RecipeIngredient[];
  onChange: (ingredients: RecipeIngredient[]) => void;
  className?: string;
};

const defaultUnits = ['g', 'kg', 'cl', 'L', 'ml', 'pièce(s)', 'c. à soupe', 'c. à café', 'pincée(s)', ''] as const;

function generateId() {
  return crypto.randomUUID?.() ?? `ing-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function RecipeIngredientsField({ ingredients, onChange, className }: Readonly<RecipeIngredientsFieldProps>) {
  function addIngredient() {
    onChange([...ingredients, { id: generateId(), quantity: '', unit: '', name: '' }]);
  }

  function removeIngredient(id: string) {
    onChange(ingredients.filter((i) => i.id !== id));
  }

  function updateIngredient(id: string, field: keyof RecipeIngredient, value: string) {
    onChange(ingredients.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  return (
    <fieldset className={cn('space-y-2', className)}>
      <legend className="text-sm font-medium">Ingrédients</legend>
      <ul className="flex flex-col gap-3 list-none p-0 m-0">
        {ingredients.map((ing, index) => (
          <li key={ing.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-input bg-muted/30 p-3">
            <span className="text-xs font-medium text-muted-foreground w-6">{index + 1}.</span>
            <Input
              placeholder="Quantité"
              value={ing.quantity}
              onChange={(e) => updateIngredient(ing.id, 'quantity', e.target.value)}
              className="w-20 shrink-0"
              aria-label={`Quantité ingrédient ${index + 1}`}
            />
            <select
              value={ing.unit}
              onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
              className="h-9 w-28 shrink-0 rounded-md border border-input bg-background px-2 text-sm"
              aria-label={`Unité ingrédient ${index + 1}`}
            >
              {defaultUnits.map((u) => (
                <option key={u || 'vide'} value={u}>
                  {u || '—'}
                </option>
              ))}
            </select>
            <Input
              placeholder="Nom de l'ingrédient"
              value={ing.name}
              onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
              className="min-w-0 flex-1"
              aria-label={`Nom ingrédient ${index + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeIngredient(ing.id)}
              aria-label={`Supprimer ingrédient ${index + 1}`}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
        <Plus className="mr-2 size-4" />
        Ajouter un ingrédient
      </Button>
    </fieldset>
  );
}
