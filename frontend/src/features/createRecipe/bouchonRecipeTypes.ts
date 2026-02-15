export type RecipeTypeId =
  | 'plat'
  | 'dessert'
  | 'apero'
  | 'sauce'
  | 'entree'
  | 'autres';

export type RecipeTypeOption = {
  id: RecipeTypeId;
  label: string;
};

export const bouchonRecipeTypes: RecipeTypeOption[] = [
  { id: 'plat', label: 'Plat' },
  { id: 'dessert', label: 'Dessert' },
  { id: 'apero', label: 'Apéro' },
  { id: 'sauce', label: 'Sauce' },
  { id: 'entree', label: 'Entrée' },
  { id: 'autres', label: 'Autres' },
];
