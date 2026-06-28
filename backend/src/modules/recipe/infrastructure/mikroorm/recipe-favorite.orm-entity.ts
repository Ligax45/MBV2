import { EntitySchema, ReferenceKind } from '@mikro-orm/core';
import { RecipeOrmEntity } from './recipe.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

export class RecipeFavoriteOrmEntity {
  user!: UserOrmEntity;

  recipe!: RecipeOrmEntity;

  createdAt: Date = new Date();
}

export const RecipeFavoriteOrmEntitySchema =
  new EntitySchema<RecipeFavoriteOrmEntity>({
    class: RecipeFavoriteOrmEntity,
    tableName: 'recipe_favorites',
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
      createdAt: {
        type: 'datetime',
        fieldNames: ['created_at'],
        defaultRaw: 'NOW()',
      },
    },
  });
