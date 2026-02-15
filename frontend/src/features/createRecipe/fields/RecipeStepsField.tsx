import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { RecipeStep } from '../types';
import { cn } from '@/lib/utils';

type RecipeStepsFieldProps = {
  steps: RecipeStep[];
  onChange: (steps: RecipeStep[]) => void;
  className?: string;
};

function generateId() {
  return crypto.randomUUID?.() ?? `step-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function RecipeStepsField({ steps, onChange, className }: Readonly<RecipeStepsFieldProps>) {
  function addStep() {
    const newOrder = steps.length > 0 ? Math.max(...steps.map((s) => s.order)) + 1 : 1;
    onChange([...steps, { id: generateId(), content: '', order: newOrder }]);
  }

  function removeStep(id: string) {
    const remaining = steps.filter((s) => s.id !== id);
    onChange(remaining.map((s, i) => ({ ...s, order: i + 1 })));
  }

  function updateStep(id: string, content: string) {
    onChange(steps.map((s) => (s.id === id ? { ...s, content } : s)));
  }

  return (
    <fieldset className={cn('space-y-2', className)}>
      <legend className="text-sm font-medium">Étapes</legend>
      <ol className="flex flex-col gap-3 list-none p-0 m-0">
        {steps.map((step, index) => (
          <li key={step.id} className="flex gap-3 rounded-lg border border-input bg-muted/30 p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {index + 1}
            </span>
            <textarea
              placeholder={`Étape ${index + 1}...`}
              value={step.content}
              onChange={(e) => updateStep(step.id, e.target.value)}
              rows={3}
              className="min-h-0 min-w-0 flex-1 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none disabled:opacity-50"
              aria-label={`Étape ${index + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeStep(step.id)}
              aria-label={`Supprimer étape ${index + 1}`}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ol>
      <Button type="button" variant="outline" size="sm" onClick={addStep}>
        <Plus className="mr-2 size-4" />
        Ajouter une étape
      </Button>
    </fieldset>
  );
}
