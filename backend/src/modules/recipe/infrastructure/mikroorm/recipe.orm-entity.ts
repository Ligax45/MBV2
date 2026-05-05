import { EntitySchema, ReferenceKind } from '@mikro-orm/core';
import { RecipeTypeOrmEntity } from './recipe-type.orm-entity';

export class RecipeOrmEntity {
  id!: string;

  title!: string;

  description!: string;

  imageUrl?: string | null;

  difficulty!: 'facile' | 'moyen' | 'difficile';

  servings!: number;

  recipeType!: RecipeTypeOrmEntity;

  authorUserId?: string | null;

  prepMinutes: number = 0;

  cookMinutes: number = 0;

  restMinutes: number = 0;

  createdAt: Date = new Date();

  updatedAt: Date = new Date();
}

export const RecipeOrmEntitySchema = new EntitySchema<RecipeOrmEntity>({
  class: RecipeOrmEntity,
  tableName: 'recipes',
  properties: {
    id: { primary: true, type: 'uuid', defaultRaw: 'gen_random_uuid()' },
    title: { type: 'string', length: 150 },
    description: { type: 'text' },
    imageUrl: {
      type: 'string',
      nullable: true,
      fieldName: 'image_url',
      length: 500,
    },
    difficulty: { type: 'string', length: 20 },
    servings: { type: 'smallint' },
    recipeType: {
      kind: ReferenceKind.MANY_TO_ONE,
      entity: () => RecipeTypeOrmEntity,
      fieldNames: ['recipe_type_id'],
      nullable: false,
    },
    authorUserId: { type: 'uuid', nullable: true, fieldName: 'author_user_id' },
    prepMinutes: { type: 'smallint', fieldName: 'prep_minutes', default: 0 },
    cookMinutes: { type: 'smallint', fieldName: 'cook_minutes', default: 0 },
    restMinutes: { type: 'smallint', fieldName: 'rest_minutes', default: 0 },
    createdAt: {
      type: 'Date',
      fieldName: 'created_at',
      onCreate: () => new Date(),
    },
    updatedAt: {
      type: 'Date',
      fieldName: 'updated_at',
      onCreate: () => new Date(),
      onUpdate: () => new Date(),
    },
  },
});
