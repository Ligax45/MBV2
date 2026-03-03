export type RecipeTypeId = 'plat' | 'dessert' | 'apero' | 'sauce' | 'entree' | 'autres';

export type RecipeTypeOption = {
  id: RecipeTypeId;
  label: string;
};

export const bouchonRecipeTypes: RecipeTypeOption[] = [
  { id: 'apero', label: 'Apéro' },
  { id: 'entree', label: 'Entrée' },
  { id: 'plat', label: 'Plat' },
  { id: 'dessert', label: 'Dessert' },
  { id: 'sauce', label: 'Sauce' },
  { id: 'autres', label: 'Autres' },
];
