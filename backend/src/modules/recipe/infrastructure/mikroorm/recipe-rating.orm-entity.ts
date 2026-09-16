import { EntitySchema, ReferenceKind } from '@mikro-orm/core';
import { RecipeOrmEntity } from './recipe.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

export class RecipeRatingOrmEntity {
  user!: UserOrmEntity;

  recipe!: RecipeOrmEntity;

  /** Half-star units from 1 (0.5) to 10 (5.0). */
  rating!: number;

  createdAt: Date = new Date();

  updatedAt: Date = new Date();
}

export const RecipeRatingOrmEntitySchema = new EntitySchema<RecipeRatingOrmEntity>(
  {
    class: RecipeRatingOrmEntity,
    tableName: 'recipe_ratings',
    properties: {
      user: {
        kind: ReferenceKind.MANY_TO_ONE,
        entity: () => UserOrmEntity,
        primary: true,
        fieldNames: ['user_id'],
        nullable: false,
      },
      recipe: {
        kind: ReferenceKind.MANY_TO_ONE,
        entity: () => RecipeOrmEntity,
        primary: true,
        fieldNames: ['recipe_id'],
        nullable: false,
      },
      rating: { type: 'smallint' },
      createdAt: {
        type: 'datetime',
        fieldNames: ['created_at'],
        defaultRaw: 'NOW()',
      },
      updatedAt: {
        type: 'datetime',
        fieldNames: ['updated_at'],
        defaultRaw: 'NOW()',
      },
    },
  },
);
