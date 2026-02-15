import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type RecipeServingsFieldProps = {
  value: number;
  className?: string;
};

export function RecipeServingsField({ value, className }: Readonly<RecipeServingsFieldProps>) {
  return (
    <div className={cn('space-y-2', className)}>
      <span className="text-sm font-medium">Nombre de personnes</span>
      <div className="flex items-center gap-2 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
        <Users className="size-4 shrink-0" />
        <span>{value} personnes</span>
      </div>
      <p className="text-xs text-muted-foreground">Actuellement fixé à 2 personnes</p>
    </div>
  );
}
