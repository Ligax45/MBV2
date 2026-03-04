import { cn } from '@/lib/utils';

type RecipeDescriptionFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
};

export const RecipeDescriptionField = ({
  value,
  onChange,
  error,
  className,
}: Readonly<RecipeDescriptionFieldProps>) => (
  <div className={cn('space-y-2', className)}>
    <label htmlFor="recipe-description" className="text-sm font-medium">
      Description
    </label>
    <textarea
      id="recipe-description"
      placeholder="Décrivez brièvement votre recette..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className={cn(
        'w-full min-w-0 resize-y rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        'border-input dark:bg-input/30',
        error && 'border-destructive'
      )}
      aria-invalid={!!error}
    />
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);
