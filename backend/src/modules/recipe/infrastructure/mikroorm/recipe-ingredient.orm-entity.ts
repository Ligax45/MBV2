import { EntitySchema, ReferenceKind } from '@mikro-orm/core';
import { RecipeOrmEntity } from './recipe.orm-entity';

export class RecipeIngredientOrmEntity {
  id!: string;

  recipe!: RecipeOrmEntity;

  position!: number;

  quantity!: string;

  unit!: string;

  name!: string;
}

export const RecipeIngredientOrmEntitySchema =
  new EntitySchema<RecipeIngredientOrmEntity>({
    class: RecipeIngredientOrmEntity,
    tableName: 'recipe_ingredients',
    properties: {
      id: { primary: true, type: 'uuid', defaultRaw: 'gen_random_uuid()' },
      recipe: {
        kind: ReferenceKind.MANY_TO_ONE,
        entity: () => RecipeOrmEntity,
        fieldNames: ['recipe_id'],
        nullable: false,
      },
      position: { type: 'integer' },
      quantity: { type: 'string', length: 32 },
      unit: { type: 'string', length: 32 },
      name: { type: 'string', length: 120 },
    },
  });
