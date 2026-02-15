import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type RecipeTitleFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
};

export function RecipeTitleField({ value, onChange, error, className }: Readonly<RecipeTitleFieldProps>) {
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor="recipe-title" className="text-sm font-medium">
        Titre
      </label>
      <Input
        id="recipe-title"
        type="text"
        placeholder="Ex : Tarte aux pommes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(error && 'border-destructive')}
        aria-invalid={!!error}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
