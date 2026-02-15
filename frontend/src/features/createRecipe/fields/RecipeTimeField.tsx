import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { RecipeTime } from '../types';
import { cn } from '@/lib/utils';

type RecipeTimeFieldProps = {
  value: RecipeTime;
  onChange: (value: RecipeTime) => void;
  className?: string;
};

export function RecipeTimeField({ value, onChange, className }: Readonly<RecipeTimeFieldProps>) {
  function updateField(field: keyof RecipeTime, minutes: number) {
    onChange({ ...value, [field]: Math.max(0, minutes) });
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="flex items-center gap-2 text-sm font-medium">
        <Clock className="size-4" />
        Temps de réalisation
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="time-prep" className="text-xs text-muted-foreground">
            Préparation (min)
          </label>
          <Input
            id="time-prep"
            type="number"
            min={0}
            value={value.preparationMinutes || ''}
            onChange={(e) => updateField('preparationMinutes', Number(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="time-cook" className="text-xs text-muted-foreground">
            Cuisson (min)
          </label>
          <Input
            id="time-cook"
            type="number"
            min={0}
            value={value.cookingMinutes || ''}
            onChange={(e) => updateField('cookingMinutes', Number(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="time-rest" className="text-xs text-muted-foreground">
            Repos (min)
          </label>
          <Input
            id="time-rest"
            type="number"
            min={0}
            value={value.restMinutes || ''}
            onChange={(e) => updateField('restMinutes', Number(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}
