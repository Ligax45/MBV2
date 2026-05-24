export const BOUCHON_EQUIPMENT: readonly { id: string; label: string }[] = [
  { id: 'four', label: 'Four' },
  { id: 'micro-onde', label: 'Micro-onde' },
  { id: 'mixeur', label: 'Mixeur' },
  { id: 'robot-cuisine', label: 'Robot cuisine' },
  { id: 'plaques', label: 'Plaques / feux' },
  { id: 'casserole', label: 'Casserole' },
  { id: 'poele', label: 'Poêle' },
  { id: 'batteur', label: 'Batteur électrique' },
  { id: 'balance', label: 'Balance' },
  { id: 'thermomix', label: 'Thermomix' },
  { id: 'moule', label: 'Moule' },
  { id: 'passoire', label: 'Passoire' },
] as const;

export function getEquipmentLabels(ids: readonly string[]): string[] {
  return ids.map(
    (id) => BOUCHON_EQUIPMENT.find((e) => e.id === id)?.label ?? id,
  );
}
