export type RecipeTypeSummary = { id: string; label: string };

export type EquipmentSummary = { id: string; label: string };

export type RecipeIngredientSummary = {
  id: string;
  position: number;
  quantity: string;
  unit: string;
  name: string;
};

export type RecipeStepSummary = {
  id: string;
  order: number;
  content: string;
};

export class Recipe {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly difficulty: 'facile' | 'moyen' | 'difficile',
    public readonly servings: number,
    public readonly recipeType: RecipeTypeSummary,
    public readonly imageUrl: string | null,
    public readonly authorUserId: string | null,
    public readonly authorName: string | null,
    public readonly prepMinutes: number,
    public readonly cookMinutes: number,
    public readonly restMinutes: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly ingredients: RecipeIngredientSummary[] = [],
    public readonly steps: RecipeStepSummary[] = [],
    public readonly equipment: EquipmentSummary[] = [],
  ) {}
}
