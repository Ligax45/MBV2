import { Recipe } from '../domain/entities/recipe.entity';
import { buildRecipePdfDocument } from './recipe-pdf-document.builder';

function createRecipe(overrides: Partial<ConstructorParameters<typeof Recipe>> = {}): Recipe {
  const defaults: ConstructorParameters<typeof Recipe> = [
    '11111111-1111-1111-1111-111111111111',
    'Tarte aux pommes',
    'Description',
    'facile',
    4,
    { id: 'type-1', label: 'Dessert' },
    null,
    'user-1',
    'Alice',
    20,
    35,
    10,
    new Date('2024-01-01'),
    new Date('2024-01-02'),
    [
      { id: 'i2', position: 2, quantity: '2', unit: 'kg', name: 'pommes' },
      { id: 'i1', position: 1, quantity: '200', unit: 'g', name: 'farine' },
    ],
    [
      { id: 's2', order: 2, title: 'Cuisson', content: 'Enfourner 30 min.' },
      { id: 's1', order: 1, title: null, content: 'Préparer la pâte.' },
    ],
    [{ id: 'e1', label: 'Four' }],
    'public',
    'approved',
    null,
    null,
    null,
  ];

  const args = defaults.map((value, index) =>
    overrides[index] !== undefined ? overrides[index] : value,
  ) as ConstructorParameters<typeof Recipe>;

  return new Recipe(...args);
}

describe('buildRecipePdfDocument', () => {
  it('includes title, meta, sorted ingredients and steps', () => {
    const doc = buildRecipePdfDocument(createRecipe());

    expect(doc.content?.[0]).toEqual({
      text: 'Tarte aux pommes',
      style: 'title',
    });
    expect(doc.content?.[1]).toEqual({
      text: 'Dessert',
      style: 'subtitle',
    });
    expect(doc.content?.[2]).toEqual({
      text: 'Préparation 20 min · Cuisson 35 min · Repos 10 min',
      style: 'meta',
    });

    const ingredients = doc.content?.find(
      (item) => typeof item === 'object' && item !== null && 'ul' in item,
    ) as { ul: string[] };

    expect(ingredients.ul).toEqual(['200 g farine', '2 kg pommes']);

    const steps = doc.content?.find(
      (item) => typeof item === 'object' && item !== null && 'ol' in item,
    ) as { ol: string[] };

    expect(steps.ol).toEqual([
      'Préparer la pâte.',
      'Cuisson — Enfourner 30 min.',
    ]);
  });

  it('omits equipment section when empty', () => {
    const recipe = createRecipe();
    const recipeWithoutEquipment = new Recipe(
      recipe.id,
      recipe.title,
      recipe.description,
      recipe.difficulty,
      recipe.servings,
      recipe.recipeType,
      recipe.imageUrl,
      recipe.authorUserId,
      recipe.authorName,
      recipe.prepMinutes,
      recipe.cookMinutes,
      recipe.restMinutes,
      recipe.createdAt,
      recipe.updatedAt,
      recipe.ingredients,
      recipe.steps,
      [],
      recipe.visibility,
      recipe.moderationStatus,
      recipe.moderationComment,
      recipe.reviewedAt,
      recipe.reviewedByUserId,
    );

    const doc = buildRecipePdfDocument(recipeWithoutEquipment);
    const labels = (doc.content ?? [])
      .filter((item) => typeof item === 'object' && item !== null && 'text' in item)
      .map((item) => (item as { text: string }).text);

    expect(labels).not.toContain('Équipement');
  });
});
