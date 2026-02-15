import { bouchonRecipeTypes } from '../bouchonRecipeTypes';
import type { RecipeTypeId } from '../bouchonRecipeTypes';
import { cn } from '@/lib/utils';

type RecipeTypeFieldProps = {
  value: RecipeTypeId | '';
  onChange: (value: RecipeTypeId | '') => void;
  className?: string;
};

export function RecipeTypeField({ value, onChange, className }: Readonly<RecipeTypeFieldProps>) {
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor="recipe-type" className="text-sm font-medium">
        Type de recette
      </label>
      <select
        id="recipe-type"
        value={value}
        onChange={(e) => onChange((e.target.value || '') as RecipeTypeId | '')}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none disabled:opacity-50"
      >
        <option value="">Sélectionnez un type</option>
        {bouchonRecipeTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
}
