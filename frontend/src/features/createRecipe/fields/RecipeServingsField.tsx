import { Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type RecipeServingsFieldProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
};

export const RecipeServingsField = ({ value, onChange, className }: Readonly<RecipeServingsFieldProps>) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(1);
      return;
    }
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n) && n >= 1) onChange(Math.min(n, 999));
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor="servings" className="text-sm font-medium">
        Nombre de personnes
      </label>
      <div className="flex items-center gap-2 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
        <Users className="size-4 shrink-0 text-muted-foreground" />
        <Input
          id="servings"
          type="number"
          min={1}
          max={999}
          value={value}
          onChange={handleChange}
          className="h-auto rounded-none border-0 bg-transparent p-0 text-foreground shadow-none focus-visible:ring-0"
          aria-label="Nombre de personnes"
        />
        <span className="text-muted-foreground">personnes</span>
      </div>
    </div>
  );
};
