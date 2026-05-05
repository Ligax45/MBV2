import { EntitySchema } from '@mikro-orm/core';

export class RecipeTypeOrmEntity {
  id!: string;

  label!: string;
}

export const RecipeTypeOrmEntitySchema = new EntitySchema<RecipeTypeOrmEntity>({
  class: RecipeTypeOrmEntity,
  tableName: 'recipe_types',
  properties: {
    id: { primary: true, type: 'uuid', defaultRaw: 'gen_random_uuid()' },
    label: { type: 'string', length: 64 },
  },
});
