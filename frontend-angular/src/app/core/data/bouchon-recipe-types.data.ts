export type RecipeTypeId =
  | 'plat'
  | 'dessert'
  | 'apero'
  | 'sauce'
  | 'entree'
  | 'autres';

export const BOUCHON_RECIPE_TYPES: readonly {
  id: RecipeTypeId;
  label: string;
}[] = [
  { id: 'apero', label: 'Apéro' },
  { id: 'entree', label: 'Entrée' },
  { id: 'plat', label: 'Plat' },
  { id: 'dessert', label: 'Dessert' },
  { id: 'sauce', label: 'Sauce' },
  { id: 'autres', label: 'Autres' },
] as const;

export function getRecipeTypeLabel(id: RecipeTypeId): string {
  return BOUCHON_RECIPE_TYPES.find((t) => t.id === id)?.label ?? id;
}
