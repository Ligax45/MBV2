import type { RecipeDifficulty } from '../types';
import { cn } from '@/lib/utils';

const DIFFICULTY_OPTIONS: { value: RecipeDifficulty; label: string }[] = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
];

type RecipeDifficultyFieldProps = {
  value: RecipeDifficulty | '';
  onChange: (value: RecipeDifficulty | '') => void;
  className?: string;
};

export const RecipeDifficultyField = ({
  value,
  onChange,
  className,
}: Readonly<RecipeDifficultyFieldProps>) => (
  <div className={cn('space-y-2', className)}>
    <label htmlFor="recipe-difficulty" className="text-sm font-medium">
      Difficulté
    </label>
    <select
      id="recipe-difficulty"
      value={value}
      onChange={(e) => onChange((e.target.value || '') as RecipeDifficulty | '')}
      className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none disabled:opacity-50"
    >
      <option value="">Sélectionnez une difficulté</option>
      {DIFFICULTY_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
