import { bouchonEquipment } from '../bouchonEquipment';
import type { EquipmentId } from '../bouchonEquipment';
import { cn } from '@/lib/utils';

type RecipeEquipmentFieldProps = {
  value: EquipmentId[];
  onChange: (value: EquipmentId[]) => void;
  className?: string;
};

export function RecipeEquipmentField({ value, onChange, className }: Readonly<RecipeEquipmentFieldProps>) {
  function toggleEquipment(id: EquipmentId) {
    if (value.includes(id)) {
      onChange(value.filter((e) => e !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <fieldset className={cn('space-y-2', className)}>
      <legend className="text-sm font-medium">Équipement</legend>
      <div className="flex flex-wrap gap-2">
        {bouchonEquipment.map((equip) => (
          <label
            key={equip.id}
            className={cn(
              'cursor-pointer select-none rounded-full border px-3 py-1.5 text-sm transition-colors',
              value.includes(equip.id)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-muted/50 hover:bg-muted',
            )}
          >
            <input
              type="checkbox"
              checked={value.includes(equip.id)}
              onChange={() => toggleEquipment(equip.id)}
              className="sr-only"
            />
            {equip.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
