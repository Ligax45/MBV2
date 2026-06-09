import { EntitySchema, ReferenceKind } from '@mikro-orm/core';
import { RecipeOrmEntity } from './recipe.orm-entity';

export class RecipeStepOrmEntity {
  id!: string;

  recipe!: RecipeOrmEntity;

  stepOrder!: number;

  content!: string;
}

export const RecipeStepOrmEntitySchema = new EntitySchema<RecipeStepOrmEntity>({
  class: RecipeStepOrmEntity,
  tableName: 'recipe_steps',
  properties: {
    id: { primary: true, type: 'uuid', defaultRaw: 'gen_random_uuid()' },
    recipe: {
      kind: ReferenceKind.MANY_TO_ONE,
      entity: () => RecipeOrmEntity,
      fieldNames: ['recipe_id'],
      nullable: false,
    },
    stepOrder: { type: 'integer', fieldName: 'step_order' },
    content: { type: 'text' },
  },
});
